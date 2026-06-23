import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

// ─────────────────────────────────────────────
// 1. Dedicated axios instance — never pollutes
//    global axios.defaults
// ─────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends httpOnly cookies automatically
});

// ─────────────────────────────────────────────
// 2. Token stored only in memory (not localStorage)
//    This prevents XSS token theft
// ─────────────────────────────────────────────
let _accessToken = null;

export const getAccessToken = () => _accessToken;
export const setAccessToken = (token) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };

// ─────────────────────────────────────────────
// 3. Request interceptor — attaches Bearer token
//    to every request automatically
// ─────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// 4. Context
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

// ─────────────────────────────────────────────
// 5. AuthProvider
// ─────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tracks if a token refresh is already in-flight so we don't
  // fire multiple refresh requests simultaneously
  const isRefreshing = useRef(false);
  const failedQueue = useRef([]);

  // ── Helper: flush queued requests after a refresh attempt ──
  const processQueue = (error, token = null) => {
    failedQueue.current.forEach(({ resolve, reject }) => {
      error ? reject(error) : resolve(token);
    });
    failedQueue.current = [];
  };

  // ── Helper: build clean user object from API response ──
  const buildUserData = (data) => ({
    id: data._id,
    email: data.email,
    username: data.username,
    fullName: data.fullName,
    role: data.role,
    points: data.points,
    profilePicture: data.profile_picture,
  });

  // ─────────────────────────────────────────────
  // 6. Response interceptor — handles 401s by
  //    attempting a silent token refresh, then
  //    retrying the original request.
  //    Falls back to logout if refresh fails.
  // ─────────────────────────────────────────────
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh on 401, and not on the refresh
        // endpoint itself to avoid infinite loops
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes("/auth/refresh")
        ) {
          if (isRefreshing.current) {
            // Queue this request until the refresh resolves
            return new Promise((resolve, reject) => {
              failedQueue.current.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing.current = true;

          try {
            // Refresh token lives in httpOnly cookie — no JS access needed
            const { data } = await api.post("/auth/refresh");
            setAccessToken(data.accessToken);
            processQueue(null, data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            // Refresh failed — session is dead, log the user out
            handleLogout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing.current = false;
          }
        }

        return Promise.reject(error);
      }
    );

    // Clean up interceptor when provider unmounts
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // ─────────────────────────────────────────────
  // 7. On app load — validate session with server
  //    instead of blindly trusting localStorage
  // ─────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Server reads the httpOnly refresh cookie and issues
        // a fresh access token if the session is still valid
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);

        const userRes = await api.get("/auth/me");
        setUser(buildUserData(userRes.data));
      } catch {
        // No valid session — start fresh, no error needed
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─────────────────────────────────────────────
  // 8. Auth actions
  // ─────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      // Server sets httpOnly refresh cookie in the response
      const { data } = await api.post("/auth/login", { email, password });
      setAccessToken(data.accessToken);

      const userRes = await api.get("/auth/me");
      const userData = buildUserData(userRes.data);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  }, []);

  const register = useCallback(async (name, username, email, password) => {
    try {
      await api.post("/auth/register", {
        fullName: name,
        username,
        email,
        password,
      });
      // Auto-login after successful registration
      return await login(email, password);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  }, [login]);

  // Extracted so the response interceptor can call it too
  const handleLogout = useCallback(async () => {
    try {
      // Tell server to invalidate the refresh token / clear cookie
      await api.post("/auth/logout");
    } catch {
      // Even if the server call fails, clear client state
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => handleLogout(), [handleLogout]);

  const updateUser = useCallback((userData) => {
    // Only update in React state — no localStorage
    setUser((prev) => ({ ...prev, ...userData }));
  }, []);

  // ─────────────────────────────────────────────
  // 9. Provide values
  // ─────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        loading,
        isLoggedIn: !!user,
        api, // expose the configured instance so components use it
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────
// 10. useAuth hook
// ─────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
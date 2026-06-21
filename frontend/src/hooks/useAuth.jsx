import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log("Restored session for user:", userData.email);
      } catch (err) {
        console.error("Failed to parse saved user data:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else {
      console.log("No saved session found");
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const { token } = res.data;
      localStorage.setItem("token", token);

      // Get user info from /api/auth/me
      const userRes = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = {
        id: userRes.data._id,
        email: userRes.data.email,
        username: userRes.data.username,
        fullName: userRes.data.fullName,
        name: userRes.data.fullName || userRes.data.username,
        role: userRes.data.role,
        points: userRes.data.points,
        profilePicture: userRes.data.profile_picture,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: name,
        email,
        password,
      });
      const { id } = res.data;

      // Auto login after register
      return await login(email, password);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

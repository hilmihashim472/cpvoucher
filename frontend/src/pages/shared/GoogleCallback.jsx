import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth, setAccessToken, api } from "../../hooks/useAuth.jsx";
import { Loader2 } from "lucide-react";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Google authentication failed. Please try again.");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return;
    }

    if (!token) {
      setError("No authentication token received.");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return;
    }

    const finishAuth = async () => {
      // Save the access token in memory
      setAccessToken(token);

      try {
        // Fetch full user profile
        const userRes = await api.get("/auth/me");
        const data = userRes.data;
        const userData = {
          id: data._id,
          email: data.email,
          username: data.username,
          fullName: data.fullName,
          role: data.role,
          points: data.points,
          profilePicture: data.profile_picture,
        };
        setUser(userData);

        // Redirect based on role
        navigate(userData.role === "admin" ? "/admin" : "/home", { replace: true });
      } catch {
        navigate("/home", { replace: true });
      }
    };

    finishAuth();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="auth-shell">
      <div className="auth-right" style={{ margin: "0 auto", width: "100%" }}>
        <div className="text-center">
          {error ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="auth-card-title">Authentication failed</h2>
              <p className="auth-card-subtitle">{error}</p>
              <p className="text-xs text-muted mt-4">Redirecting to login...</p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
              </div>
              <h2 className="auth-card-title">Signing you in...</h2>
              <p className="auth-card-subtitle">
                Please wait while we complete your authentication.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Check } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
import { useAuth } from "../../hooks/useAuth.jsx";

const FEATURES = [
  "300+ exclusive brand vouchers",
  "Earn points on every redemption",
  "Early access to limited deals",
];

function validate(form) {
  const errors = {};
  if (!form.email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address.";
  if (!form.password) errors.password = "Password is required.";
  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate(form);
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        toast.success("Signed in successfully!");
        navigate(result.user?.role === "admin" ? "/admin" : "/home");
      } else {
        toast.error(result.message || "Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left branding panel */}
      <div className="auth-left">
        <span className="auth-left-logo">VoucherHub</span>
        <div>
          <h1 className="auth-left-title">Welcome back to your savings hub.</h1>
          <p className="auth-left-subtitle">
            Sign in to redeem exclusive vouchers and track your rewards.
          </p>
          <ul className="auth-feature-list">
            {FEATURES.map((feature) => (
              <li key={feature} className="auth-feature-item">
                <span className="auth-feature-check" aria-hidden="true">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="auth-testimonial">
            <p className="auth-testimonial-text">
              &ldquo;I saved over RM500 in a single month using VoucherHub. It&apos;s
              the best deal platform I&apos;ve ever used.&rdquo;
            </p>
            <p className="auth-testimonial-author">— Sarah Lim, Kuala Lumpur</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <span className="auth-mobile-logo">VoucherHub</span>

        <div className="auth-card">
          <h2 className="auth-card-title">Sign in to your account</h2>
          <p className="auth-card-subtitle">
            Enter your credentials to access your vouchers.
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => { window.location.href = `${BACKEND_URL}/api/auth/google`; }}
              className="auth-google-button"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or continue with email</span>
            <div className="auth-divider-line" />
          </div>

          <form className="auth-form !mt-0" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" aria-hidden="true" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
                />
              </div>
              {errors.email && <p className="auth-error-text">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`auth-input pr-10 ${errors.password ? "auth-input-error" : ""}`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="auth-input-suffix auth-password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && <p className="auth-error-text">{errors.password}</p>}
            </div>

            {/* Remember me + forgot password */}
            <div className="auth-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="auth-checkbox"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-button">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="auth-footer-link">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

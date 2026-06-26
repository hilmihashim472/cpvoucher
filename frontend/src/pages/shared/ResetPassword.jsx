import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, Check, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.jsx";

const FEATURES = [
  "Set a strong new password",
  "Link expires after 15 minutes",
  "Your account stays secure",
];

function validate(form) {
  const errors = {};
  if (!form.password) errors.password = "New password is required.";
  else if (form.password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  if (!form.confirm) errors.confirm = "Please confirm your password.";
  else if (form.password !== form.confirm)
    errors.confirm = "Passwords do not match.";
  return errors;
}

function SuccessState() {
  return (
    <div className="auth-card text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <ShieldCheck className="h-8 w-8 text-success" aria-hidden="true" />
      </div>
      <h2 className="auth-card-title">Password reset!</h2>
      <p className="auth-card-subtitle">
        Your password has been changed successfully. You can now sign in with
        your new password.
      </p>

      <Link
        to="/login"
        className="auth-submit-button mt-6 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Sign In
      </Link>
    </div>
  );
}

export default function ResetPassword() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Redirect to forgot-password if no token is present
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset link");
      navigate("/forgot-password", { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password: form.password });
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        "Failed to reset password. The link may have expired.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null; // Will redirect via useEffect

  return (
    <div className="auth-shell">
      {/* Left branding panel */}
      <div className="auth-left">
        <span className="auth-left-logo">Carter Bank Voucher</span>
        <div>
          <h1 className="auth-left-title">Set a new password.</h1>
          <p className="auth-left-subtitle">
            Enter your new password below. Make sure it's strong and unique.
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
              &ldquo;Recovered my account in under a minute. Super smooth
              process — the reset email arrived instantly.&rdquo;
            </p>
            <p className="auth-testimonial-author">— Amir Hassan, Johor Bahru</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <span className="auth-mobile-logo">Carter Bank Voucher</span>

        {success ? (
          <SuccessState />
        ) : (
          <div className="auth-card">
            <h2 className="auth-card-title">Choose a new password</h2>
            <p className="auth-card-subtitle">
              Must be at least 8 characters. Make it something memorable (but
              hard to guess).
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* New Password */}
              <div className="auth-field">
                <label htmlFor="rp-password" className="auth-label">
                  New Password
                </label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="rp-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    className={`auth-input ${errors.password ? "auth-input-error" : ""}`}
                  />
                  <button
                    type="button"
                    className="auth-input-suffix"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="auth-password-toggle h-4 w-4" />
                    ) : (
                      <Eye className="auth-password-toggle h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="auth-error-text">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label htmlFor="rp-confirm" className="auth-label">
                  Confirm Password
                </label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="rp-confirm"
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                    value={form.confirm}
                    onChange={handleChange}
                    className={`auth-input ${errors.confirm ? "auth-input-error" : ""}`}
                  />
                  <button
                    type="button"
                    className="auth-input-suffix"
                    onClick={() => setShowConfirm((p) => !p)}
                    tabIndex={-1}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="auth-password-toggle h-4 w-4" />
                    ) : (
                      <Eye className="auth-password-toggle h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirm && <p className="auth-error-text">{errors.confirm}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-button"
              >
                {loading ? "Resetting password…" : "Reset Password"}
              </button>
            </form>

            <p className="auth-footer">
              Remembered your password?{" "}
              <Link to="/login" className="auth-footer-link">
                Back to Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
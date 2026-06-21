import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, User, Check } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.jsx";

const FEATURES = [
  "Completely free to join",
  "Instant access to 300+ vouchers",
  "No hidden fees, ever",
];

function validate(form, agreed) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Full name is required.";
  if (!form.email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address.";
  if (!form.password) errors.password = "Password is required.";
  else if (form.password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  if (!agreed) errors.agreed = "You must accept the terms to continue.";
  return errors;
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAgreeChange = (e) => {
    setAgreed(e.target.checked);
    if (errors.agreed) setErrors((prev) => ({ ...prev, agreed: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate(form, agreed);
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.password);
      if (result.success) {
        toast.success("Account created! Welcome to VoucherHub.");
        navigate("/home");
      } else {
        toast.error(result.message || "Registration failed. Please try again.");
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
          <h1 className="auth-left-title">Join thousands of smart shoppers.</h1>
          <p className="auth-left-subtitle">
            Create your free account and start saving today.
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
              &ldquo;Best voucher platform I&apos;ve ever used. Signing up took under
              a minute and I instantly found deals I didn&apos;t know existed.&rdquo;
            </p>
            <p className="auth-testimonial-author">— Daniel Lim, Penang</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <span className="auth-mobile-logo">VoucherHub</span>

        <div className="auth-card">
          <h2 className="auth-card-title">Create your account</h2>
          <p className="auth-card-subtitle">It&apos;s free and only takes a minute.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="auth-field">
              <label htmlFor="reg-name" className="auth-label">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" aria-hidden="true" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Chan"
                  value={form.name}
                  onChange={handleChange}
                  className={`auth-input ${errors.name ? "auth-input-error" : ""}`}
                />
              </div>
              {errors.name && <p className="auth-error-text">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="reg-email" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" aria-hidden="true" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" aria-hidden="true" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
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

            {/* Confirm Password */}
            <div className="auth-field">
              <label htmlFor="reg-confirm" className="auth-label">
                Confirm Password
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" aria-hidden="true" />
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`auth-input pr-10 ${errors.confirmPassword ? "auth-input-error" : ""}`}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="auth-input-suffix auth-password-toggle"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="auth-error-text">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="auth-field">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={handleAgreeChange}
                  className="auth-checkbox"
                />
                I agree to the{" "}
                <a href="#" className="auth-forgot-link">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="auth-forgot-link">
                  Privacy Policy
                </a>
              </label>
              {errors.agreed && <p className="auth-error-text">{errors.agreed}</p>}
            </div>

            <button type="submit" disabled={loading} className="auth-submit-button">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-footer-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

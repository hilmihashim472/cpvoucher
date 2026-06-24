import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.jsx";

const FEATURES = [
  "Reset link sent within seconds",
  "Link expires after 15 minutes",
  "Your account stays secure",
];

function validate(email) {
  if (!email) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  return null;
}

function SuccessState({ email }) {
  return (
    <div className="auth-card text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <ShieldCheck className="h-8 w-8 text-success" aria-hidden="true" />
      </div>
      <h2 className="auth-card-title">Check your inbox</h2>
      <p className="auth-card-subtitle">
        We sent a password reset link to{" "}
        <span className="font-semibold text-ink">{email}</span>. It expires in
        15 minutes.
      </p>

      <div className="my-6 rounded-xl border border-line bg-surface p-4 text-left text-sm text-muted space-y-2">
        <p className="font-semibold text-ink text-xs uppercase tracking-wide">Didn't receive it?</p>
        <p>Check your spam or junk folder.</p>
        <p>Make sure you entered the correct email address.</p>
      </div>

      <Link to="/login" className="auth-submit-button flex items-center justify-center gap-2">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Sign In
      </Link>

      <p className="auth-footer mt-4">
        Wrong email?{" "}
        <Link to="/forgot-password" className="auth-footer-link" onClick={() => window.location.reload()}>
          Try again
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPassword() {
  const { api } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(email);
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.message ?? "Something went wrong. Please try again.";
      toast.error(msg);
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
          <h1 className="auth-left-title">Locked out? We've got you covered.</h1>
          <p className="auth-left-subtitle">
            Enter your email and we'll send you a secure link to reset your
            password in seconds.
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
        <span className="auth-mobile-logo">VoucherHub</span>

        {sent ? (
          <SuccessState email={email} />
        ) : (
          <div className="auth-card">
            <h2 className="auth-card-title">Reset your password</h2>
            <p className="auth-card-subtitle">
              Enter the email tied to your account and we'll send you a reset
              link.
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="fp-email" className="auth-label">
                  Email Address
                </label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="fp-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleChange}
                    className={`auth-input ${error ? "auth-input-error" : ""}`}
                  />
                </div>
                {error && <p className="auth-error-text">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-button"
              >
                {loading ? "Sending reset link…" : "Send Reset Link"}
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

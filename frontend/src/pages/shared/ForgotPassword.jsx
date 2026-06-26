import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Check, ShieldCheck, Star } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.jsx";

const FEATURES = [
  "Reset link sent within seconds",
  "Link expires after 15 minutes",
  "Your account stays secure",
];

const STATS = [
  { value: "< 1min", label: "Avg. Recovery" },
  { value: "256-bit", label: "Encryption" },
  { value: "99.9%", label: "Uptime" },
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
        <div className="auth-left-blob-tl" />
        <div className="auth-left-blob-br" />
        <div className="auth-left-blob-mid" />
        <div className="auth-left-inner">
          <img src="/cbvlogotext.svg" alt="Carter Bank Voucher" className="auth-logo-img auth-logo-img-white" />

          <div className="auth-left-content">
            <h1 className="auth-left-title">
              Locked out? We&apos;ve got you <span className="auth-left-highlight">covered</span>.
            </h1>
            <p className="auth-left-subtitle">
              Enter your email and we&apos;ll send you a secure link to reset your password in seconds.
            </p>

            <div className="auth-stats-row">
              {STATS.map(({ value, label }) => (
                <div key={label} className="auth-stat">
                  <span className="auth-stat-value">{value}</span>
                  <span className="auth-stat-label">{label}</span>
                </div>
              ))}
            </div>

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
              <div className="auth-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="auth-testimonial-text">
                &ldquo;Recovered my account in under a minute. Super smooth process — the reset email arrived instantly.&rdquo;
              </p>
              <div className="auth-testimonial-footer">
                <div className="auth-testimonial-avatar">A</div>
                <div>
                  <p className="auth-testimonial-name">Amir Hassan</p>
                  <p className="auth-testimonial-location">Johor Bahru</p>
                </div>
              </div>
            </div>
          </div>

          <p className="auth-left-copyright">© {new Date().getFullYear()} Carter Bank Berhad. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <img src="/cbvlogotext.svg" alt="Carter Bank Voucher" className="auth-mobile-logo" />

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

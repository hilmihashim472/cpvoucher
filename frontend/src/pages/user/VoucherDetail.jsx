import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Zap, Lock, ShoppingCart } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import InlineError from "../../components/InlineError";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../hooks/useAuth.jsx";

const REDEMPTION_STEPS = [
  `Add this voucher to your cart.`,
  `Redeem it from your cart using your reward points.`,
  `Receive the voucher code after redemption is complete.`,
];

const TRUST_BADGES = [
  { label: "Verified", icon: ShieldCheck },
  { label: "Instant", icon: Zap },
  { label: "Secure", icon: Lock },
];

function getCountdown(target, now) {
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
  };
}

export default function VoucherDetail() {
  const { id } = useParams();
  // Remounting on id change resets all state below, so navigating between
  // vouchers starts from a clean loading state without extra effects.
  return <VoucherDetailContent key={id} id={id} />;
}

function VoucherDetailContent({ id }) {
  const { api } = useAuth();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    api
      .get(`/vouchers/${id}`)
      .then((res) => setVoucher(res.data))
      .catch(() => setError("Unable to load this voucher. Please try again later."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!voucher?.expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [voucher?.expiresAt]);

  const countdown = voucher?.expiresAt
    ? getCountdown(voucher.expiresAt, now)
    : { days: 0, hours: 0, minutes: 0 };

  const handleAddToCart = async () => {
    if (!voucher?._id || addingToCart) return;

    setAddingToCart(true);
    try {
      await api.post("/cart", {
        voucherId: voucher._id,
        quantity: 1,
      });
      toast.success("Added to cart");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="voucher-detail-main">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="voucher-detail-breadcrumb">
          <Link to="/categories" className="voucher-detail-breadcrumb-link">
            Category
          </Link>
          {!loading && !error && voucher && (
            <>
              <span aria-hidden="true">›</span>
              <span className="voucher-detail-breadcrumb-current">{voucher.storeName ?? voucher.brand}</span>
            </>
          )}
        </nav>

        {error && (
          <div className="voucher-detail-section">
            <InlineError message={error} />
          </div>
        )}

        {loading && (
          <div className="voucher-detail-grid">
            <div className="voucher-detail-skeleton-left">
              <div className="voucher-detail-skeleton-image" />
              <div className="voucher-detail-skeleton-title" />
              <div className="voucher-detail-skeleton-body" />
            </div>
            <div className="voucher-detail-right">
              <div className="voucher-detail-skeleton-sidebar" />
            </div>
          </div>
        )}

        {!loading && !error && !voucher && (
          <div className="voucher-detail-section">
            <EmptyState
              title="Voucher not found"
              description="This voucher may have expired or been removed."
            />
          </div>
        )}

        {!loading && !error && voucher && (
          <div className="voucher-detail-grid">
            {/* Left column (60%) */}
            <div className="voucher-detail-left">
              <div className="voucher-detail-hero-image">
                {voucher.image ? (
                  <img
                    src={voucher.image}
                    alt={voucher.title}
                    className="voucher-detail-hero-img"
                  />
                ) : (
                  <span className="voucher-detail-hero-brand" aria-hidden="true">
                    {voucher.brand}
                  </span>
                )}
                <span className="voucher-detail-hero-badge">
                  Expires in {countdown.days} day{countdown.days === 1 ? "" : "s"}
                </span>
              </div>

              <div className="voucher-detail-brand-info">
                <h1 className="voucher-detail-brand-name">{voucher.brand}</h1>
                {voucher.tagline && <p className="voucher-detail-brand-tagline">{voucher.tagline}</p>}
              </div>

              <div className="voucher-detail-instructions">
                <h2 className="voucher-detail-instructions-title">Redemption Instructions</h2>
                <ol className="voucher-detail-steps-list">
                  {REDEMPTION_STEPS.map((step, index) => (
                    <li key={step} className="voucher-detail-step">
                      <span className="voucher-detail-step-number">{index + 1}</span>
                      <p className="voucher-detail-step-text">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right column (40%) */}
            <div className="voucher-detail-right">
              <div className="voucher-detail-card">
                <span className="voucher-detail-card-badge">Limited Time Offer</span>
                <h1 className="voucher-detail-card-title">{voucher.title}</h1>
                <p className="voucher-detail-card-description">{voucher.description}</p>

                <div className="voucher-detail-code-section">
                  <p className="voucher-detail-code-label">Voucher Code</p>
                  <div className="voucher-detail-code-hidden">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    <span>Code hidden until redemption</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="voucher-detail-redeem-button"
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>

                <div className="voucher-detail-countdown-grid">
                  {["days", "hours", "minutes"].map((unit) => (
                    <div key={unit} className="voucher-detail-countdown-cell">
                      <p className="voucher-detail-countdown-value">{countdown[unit]}</p>
                      <p className="voucher-detail-countdown-label">{unit}</p>
                    </div>
                  ))}
                </div>

                <p className="voucher-detail-usage-count">
                  {voucher.usageCount ?? "0"} used today
                </p>

                <div className="voucher-detail-trust-row">
                  {TRUST_BADGES.map(({ label, icon: Icon }) => (
                    <div key={label} className="voucher-detail-trust-item">
                      <Icon className="voucher-detail-trust-icon" aria-hidden="true" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

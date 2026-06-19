import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Minus, Plus, Trash2, Info } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import InlineError from "../../components/InlineError";
import EmptyState from "../../components/EmptyState";
import useAuth from "../../hooks/useAuth";
import API_BASE_URL from "../../config/api";

export default function Cart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${API_BASE_URL}/cart`)
      .then((res) => {
        if (!isMounted) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setCartItems(data);
      })
      .catch(() => {
        if (isMounted) setError("Unable to load your cart right now. Please try again later.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateQuantity = (id, delta) => {
    const item = cartItems.find((i) => (i._id ?? i.id) === id);
    if (!item) return;
    const quantity = Math.max(1, (item.quantity ?? 1) + delta);

    setCartItems((items) =>
      items.map((i) => ((i._id ?? i.id) === id ? { ...i, quantity } : i))
    );

    axios.patch(`${API_BASE_URL}/cart/${id}`, { quantity }).catch(() => {});
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => (item._id ?? item.id) !== id));
    axios.delete(`${API_BASE_URL}/cart/${id}`).catch(() => {});
  };

  const totalCost = cartItems.reduce(
    (sum, item) => sum + (item.pointsCost ?? 0) * (item.quantity ?? 1),
    0
  );
  const remainingBalance = (user.points ?? 0) - totalCost;

  return (
    <div className="page-shell">
      <Navbar />

      <main className="cart-main">
        <div className="cart-grid">
          {/* Left column (65%) */}
          <div className="cart-left">
            <div className="cart-header">
              <h1 className="cart-title">Shopping Cart</h1>
              <span className="cart-item-count">
                {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="cart-items-list">
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="cart-skeleton-item">
                    <div className="cart-skeleton-image" />
                    <div className="cart-skeleton-info">
                      <div className="cart-skeleton-line-1" />
                      <div className="cart-skeleton-line-2" />
                      <div className="cart-skeleton-line-3" />
                    </div>
                  </div>
                ))}

              {!loading && error && <InlineError message={error} />}

              {!loading && !error && cartItems.length === 0 && (
                <EmptyState
                  title="Your cart is empty"
                  description="Browse trending vouchers and add them to your cart to redeem with points."
                  action={
                    <Link to="/" className="cart-browse-link">
                      Browse Vouchers
                    </Link>
                  }
                />
              )}

              {!loading &&
                !error &&
                cartItems.map((item) => {
                  const id = item._id ?? item.id;
                  return (
                    <div key={id} className="cart-item">
                      <div className="cart-item-icon" aria-hidden="true">
                        {item.brand?.charAt(0)}
                      </div>
                      <div className="cart-item-info">
                        <div className="cart-item-tags">
                          <span className="cart-item-category-tag">{item.category}</span>
                          {item.expiringSoon && (
                            <span className="cart-item-expiring-tag">Expiring Soon</span>
                          )}
                        </div>
                        <h3 className="cart-item-title">{item.title}</h3>
                        <p className="cart-item-description">{item.description}</p>
                        <p className="cart-item-price">
                          {Number(item.pointsCost ?? 0).toLocaleString()} pts per unit
                        </p>
                      </div>
                      <div className="cart-item-actions">
                        <div className="cart-quantity-control">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.title}`}
                            onClick={() => updateQuantity(id, -1)}
                            className="cart-quantity-button"
                          >
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <span className="cart-quantity-value">{item.quantity ?? 1}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.title}`}
                            onClick={() => updateQuantity(id, 1)}
                            className="cart-quantity-button"
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.title} from cart`}
                          onClick={() => removeItem(id)}
                          className="cart-remove-button"
                        >
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {!loading && !error && cartItems.length > 0 && (
              <div className="cart-info-banner">
                <Info className="cart-info-icon" aria-hidden="true" />
                <p>
                  Selected vouchers will be sent to your registered email
                  immediately after points deduction.
                </p>
              </div>
            )}
          </div>

          {/* Right column (35%) */}
          <div className="cart-right">
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Points Summary</h2>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Current Balance</span>
                  <span className="cart-summary-value">
                    {Number(user.points ?? 0).toLocaleString()} pts
                  </span>
                </div>
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Total Cost</span>
                  <span className="cart-summary-value-danger">
                    −{totalCost.toLocaleString()} pts
                  </span>
                </div>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-row">
                <span className="cart-remaining-label">Remaining Balance</span>
                <span className="cart-remaining-value">
                  {remainingBalance.toLocaleString()} pts
                </span>
              </div>

              <div className="cart-processing-section">
                <div className="cart-processing-header">
                  <span>Order Processing</span>
                  <span className="cart-processing-status">Ready</span>
                </div>
                <div className="cart-progress-track">
                  <div className="cart-progress-fill" />
                </div>
                <p className="cart-processing-note">
                  Voucher codes expire 24 hours after redemption if unused.
                </p>
              </div>

              <button
                type="button"
                disabled={cartItems.length === 0 || remainingBalance < 0}
                className="cart-place-order-button"
              >
                Place Order →
              </button>

              <Link to="/" className="cart-continue-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

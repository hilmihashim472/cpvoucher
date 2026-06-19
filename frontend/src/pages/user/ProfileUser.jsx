import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingBag, Ticket, TrendingUp } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import useAuth from "../../hooks/useAuth";

// TODO: replace with GET /api/users/me once the endpoint is available
const MOCK_STATS = {
  totalOrders: 42,
  lifetimeSavings: 1248.5,
  brandsUsed: 18,
};

const RECENT_ORDERS = [
  { id: 1, voucher: "Buy 1 Get 1 Free – Starbucks", date: "2026-06-18", points: 500, status: "Active" },
  { id: 2, voucher: "15% Off All Nike Footwear", date: "2026-06-15", points: 800, status: "Used" },
  { id: 3, voucher: "Free Delivery – Grab Food", date: "2026-06-10", points: 200, status: "Used" },
];

const ORDER_BADGE_STYLES = {
  Active: "profile-order-badge-active",
  Used: "profile-order-badge-used",
};

export default function ProfileUser() {
  const { user } = useAuth();
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState("alex.chan@example.com");

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: wire to PATCH /api/users/me
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="profile-main">
        {/* Profile header */}
        <div className="profile-header-card">
          <div className="profile-header-row">
            <div className="profile-avatar" aria-hidden="true">
              {user.name?.charAt(0) ?? "U"}
            </div>
            <div className="profile-info">
              <p className="profile-name">{user.name}</p>
              <p className="profile-email">{email}</p>
              <div className="profile-badges">
                <span className="profile-role-badge">{user.role ?? "user"}</span>
                <span className="profile-points-badge">
                  {Number(user.points ?? 0).toLocaleString()} pts
                </span>
              </div>
            </div>
            <button type="button" className="profile-edit-button">
              Edit Photo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="flex items-center gap-2 text-muted">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Total Orders</span>
            </div>
            <p className="profile-stat-value">{MOCK_STATS.totalOrders}</p>
            <p className="profile-stat-label">Vouchers redeemed</p>
          </div>
          <div className="profile-stat-card">
            <div className="flex items-center gap-2 text-muted">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Lifetime Savings</span>
            </div>
            <p className="profile-stat-value">${MOCK_STATS.lifetimeSavings.toFixed(2)}</p>
            <p className="profile-stat-label">Total value saved</p>
          </div>
          <div className="profile-stat-card">
            <div className="flex items-center gap-2 text-muted">
              <Ticket className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Brands Used</span>
            </div>
            <p className="profile-stat-value">{MOCK_STATS.brandsUsed}</p>
            <p className="profile-stat-label">Unique brands redeemed</p>
          </div>
        </div>

        {/* Personal info */}
        <div className="profile-section">
          <h2 className="profile-section-title">Personal Information</h2>
          <div className="profile-info-card">
            <form onSubmit={handleSave}>
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="profile-name" className="profile-label">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="profile-email" className="profile-label">Email Address</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="profile-points" className="profile-label">Points Balance</label>
                  <input
                    id="profile-points"
                    type="text"
                    value={`${Number(user.points ?? 0).toLocaleString()} pts`}
                    disabled
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="profile-role" className="profile-label">Account Type</label>
                  <input
                    id="profile-role"
                    type="text"
                    value={user.role ?? "user"}
                    disabled
                    className="profile-input"
                  />
                </div>
              </div>
              <button type="submit" className="profile-save-button">
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Recent orders */}
        <div className="profile-section">
          <h2 className="profile-section-title">Recent Orders</h2>
          <div className="profile-orders-card">
            <div className="profile-orders-header">
              <span className="profile-orders-title">Last 3 redemptions</span>
              <Link to="/orders" className="profile-orders-link">
                View all orders →
              </Link>
            </div>
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="profile-order-row">
                <div>
                  <p className="profile-order-voucher">
                    {order.voucher}
                    <span className={`profile-order-badge ${ORDER_BADGE_STYLES[order.status] ?? "profile-order-badge-used"}`}>
                      {order.status}
                    </span>
                  </p>
                  <p className="profile-order-date">{order.date}</p>
                </div>
                <span className="profile-order-pts">{order.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="profile-section">
          <h2 className="profile-section-title">Account</h2>
          <div className="profile-danger-card">
            <p className="profile-danger-title">Delete Account</p>
            <p className="profile-danger-text">
              Permanently remove your account and all associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => toast.error("Please contact support to delete your account.")}
              className="profile-danger-button"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

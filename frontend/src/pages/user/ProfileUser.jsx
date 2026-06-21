import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Camera, ShoppingBag, Ticket, TrendingUp, X } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../hooks/useAuth.jsx";
import API_BASE_URL from "../../config/api";

const ORDER_BADGE_STYLES = {
  Active: "profile-order-badge-active",
  Used: "profile-order-badge-used",
};

export default function ProfileUser() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  const [username, setUsername] = useState(user?.username || user?.name || "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture ?? null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`);
        const userData = {
          id: res.data._id,
          username: res.data.username,
          fullName: res.data.fullName,
          name: res.data.fullName || res.data.username,
          email: res.data.email,
          role: res.data.role,
          points: res.data.points,
          profilePicture: res.data.profile_picture,
        };
        updateUser(userData);
        setFullName(res.data.fullName || "");
        setUsername(res.data.username || "");
        setEmail(res.data.email);
        setProfilePicture(res.data.profile_picture || null);
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/orders/history`);
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchOrders();
  }, [updateUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/auth/me`, {
        username,
        fullName,
        email,
        profile_picture: profilePicture,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      const userData = {
        id: res.data._id,
        username: res.data.username,
        fullName: res.data.fullName,
        name: res.data.fullName || res.data.username,
        email: res.data.email,
        role: res.data.role,
        points: res.data.points,
        profilePicture: res.data.profile_picture,
      };

      updateUser(userData);
      setFullName(res.data.fullName || "");
      setUsername(res.data.username || "");
      setEmail(res.data.email);
      setProfilePicture(res.data.profile_picture || null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("Profile photo must be 1MB or smaller");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfilePicture(reader.result);
    reader.onerror = () => toast.error("Failed to read image");
    reader.readAsDataURL(file);
  };

  const totalOrders = orders.length;
  const lifetimeSavings = orders.reduce((acc, order) => {
    const discount = order.voucher?.discountAmount || 0;
    return acc + (discount * order.quantity);
  }, 0);
  const brandsUsed = new Set(orders.map(o => o.voucher?.brand)).size;

  const recentOrders = orders.slice(0, 3).map(order => ({
    id: order._id,
    voucher: order.voucher?.title || "Unknown Voucher",
    date: new Date(order.timestamp).toISOString().split('T')[0],
    points: order.voucher?.points || 0,
    status: "Used",
  }));

  return (
    <div className="page-shell">
      <Navbar />

      <main className="profile-main">
        {/* Profile header */}
        <div className="profile-header-card">
          <div className="profile-header-row">
            <div className="profile-avatar" aria-hidden="true">
              {profilePicture ? (
                <img src={profilePicture} alt="" className="profile-avatar-image" />
              ) : (
                (fullName || username || user.name)?.charAt(0) ?? "U"
              )}
            </div>
            <div className="profile-info">
              <p className="profile-name">{fullName || username || user.name}</p>
              <p className="profile-email">{email}</p>
              <div className="profile-badges">
                <span className="profile-role-badge">{user.role ?? "user"}</span>
                <span className="profile-points-badge">
                  {Number(user.points ?? 0).toLocaleString()} pts
                </span>
              </div>
            </div>
            <div className="profile-photo-actions">
              <label htmlFor="profile-photo" className="profile-edit-button">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Edit Photo
              </label>
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
              {profilePicture && (
                <button
                  type="button"
                  onClick={() => setProfilePicture(null)}
                  className="profile-remove-photo-button"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="flex items-center gap-2 text-muted">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Total Orders</span>
            </div>
            <p className="profile-stat-value">{loading ? "..." : totalOrders}</p>
            <p className="profile-stat-label">Vouchers redeemed</p>
          </div>
          <div className="profile-stat-card">
            <div className="flex items-center gap-2 text-muted">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Lifetime Savings</span>
            </div>
            <p className="profile-stat-value">${loading ? "..." : lifetimeSavings.toFixed(2)}</p>
            <p className="profile-stat-label">Total value saved</p>
          </div>
          <div className="profile-stat-card">
            <div className="flex items-center gap-2 text-muted">
              <Ticket className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Brands Used</span>
            </div>
            <p className="profile-stat-value">{loading ? "..." : brandsUsed}</p>
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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="profile-username" className="profile-label">Username</label>
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                  <label htmlFor="profile-current-password" className="profile-label">
                    Current Password
                  </label>
                  <input
                    id="profile-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Required to change password"
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="profile-new-password" className="profile-label">
                    New Password
                  </label>
                  <input
                    id="profile-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="profile-confirm-password" className="profile-label">
                    Confirm New Password
                  </label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
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
              <button type="submit" disabled={saving} className="profile-save-button">
                {saving ? "Saving..." : "Save Changes"}
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
            {loading ? (
              <p className="text-muted">Loading orders...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted">No orders yet. Start redeeming vouchers!</p>
            ) : (
              recentOrders.map((order) => (
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
              ))
            )}
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

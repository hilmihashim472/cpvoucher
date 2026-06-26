import { useState, useEffect } from "react";
import { Bell, Users, ShoppingBag, Ticket, Star, Eye } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const ACTIVITY_BORDER_STYLES = {
  danger: "system-audit-item-danger",
  success: "system-audit-item-success",
  primary: "system-audit-item-primary",
  warning: "system-audit-item-warning",
};

export default function SystemOverview() {
  const { api } = useAuth();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalVouchers: 0,
    activeVouchers: 0,
    totalPointsRedeemed: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setKpis(data.kpis);
        setRecentOrders(data.recentOrders || []);
        setRecentActivity(data.recentActivity);
      } catch (error) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [api]);

  const handleViewReceipt = (receiptUrl) => {
    if (receiptUrl) {
      window.open(`http://localhost:5000${receiptUrl}`, "_blank");
    } else {
      toast.error("Receipt not available");
    }
  };

  // Build KPI cards dynamically
  const totalCompleted = 0;
  const totalPending = 0;
  const kpiStats = [
    {
      label: "Total Users",
      value: kpis.totalUsers,
      delta: `${kpis.activeUsers} active`,
      icon: Users,
    },
    {
      label: "Total Unique Orders",
      value: kpis.totalOrders,
      delta: "All time",
      icon: ShoppingBag,
    },
    {
      label: "Total Vouchers",
      value: kpis.totalVouchers,
      delta: `${kpis.activeVouchers} active`,
      icon: Ticket,
    },
    {
      label: "Points Redeemed",
      value: kpis.totalPointsRedeemed.toLocaleString(),
      delta: "All time",
      icon: Star,
    },
  ];

  if (loading) {
    return (
      <section className="animate-pulse">
        {/* Header skeleton */}
        <div className="system-header">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-lg bg-gray-200" />
            <div className="h-4 w-72 rounded-lg bg-gray-100" />
          </div>
          <div className="h-8 w-28 rounded-full bg-gray-200" />
        </div>

        {/* KPI cards skeleton */}
        <div className="system-kpi-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="system-kpi-card">
              <div className="h-9 w-9 rounded-xl bg-gray-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-5 w-16 rounded bg-gray-200" />
                <div className="h-3.5 w-24 rounded bg-gray-100" />
                <div className="h-3 w-16 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Two-column skeleton */}
        <div className="system-columns">
          {/* Recent Orders skeleton */}
          <div className="system-left-column">
            <div className="system-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 rounded bg-gray-200" />
                <div className="h-4 w-14 rounded bg-gray-100" />
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-100" />
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-gray-100 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity skeleton */}
          <div className="system-card space-y-4">
            <div className="h-5 w-36 rounded bg-gray-200" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border-l-4 border-gray-200 pl-3 space-y-1.5 py-1">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-40 rounded bg-gray-200" />
                  <div className="h-3 w-12 rounded bg-gray-100" />
                </div>
                <div className="h-3 w-28 rounded bg-gray-100" />
                <div className="h-3 w-10 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="system-header">
        <div>
          <h1 className="system-title">System Overview</h1>
          <p className="system-subtitle">
            Real-time snapshot of platform health and activity.
          </p>
        </div>
        <div className="system-header-actions">
          <span className="system-live-badge">
            <span className="system-live-dot" aria-hidden="true" />
            System Live
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="system-kpi-grid">
        {kpiStats.map(({ label, value, delta, icon: Icon }) => (
          <div key={label} className="system-kpi-card">
            <div className="system-kpi-icon">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="system-kpi-value">{value}</p>
              <p className="system-kpi-label">{label}</p>
              {delta && <p className="system-kpi-delta">{delta}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="system-columns">
        {/* Left column */}
        <div className="system-left-column">
          <div className="system-card">
            <div className="system-card-header">
              <h2 className="system-card-title">Recent Orders</h2>
              <a href="/admin/orders" className="system-view-all-link">
                View All
              </a>
            </div>
            <ul className="system-merchant-list">
              {recentOrders.length === 0 && (
                <li className="system-merchant-empty">No orders yet.</li>
              )}
              {recentOrders.map((order) => (
                <li key={order.id} className="system-merchant-item">
                  <div className="system-merchant-info">
                    <div className="system-merchant-avatar" aria-hidden="true">
                      {order.user.charAt(0)}
                    </div>
                    <div className="system-merchant-details">
                      <p className="system-merchant-name">{order.user}</p>
                      <p className="system-merchant-deal">
                        {order.voucher} · {order.points.toLocaleString()} pts
                      </p>
                      {order.orderNumber && (
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          {order.orderNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="system-merchant-actions">
                    <button
                      type="button"
                      aria-label={`View receipt for order ${order.orderNumber || order.id}`}
                      onClick={() => handleViewReceipt(order.receiptUrl)}
                      className="system-approve-button"
                      title="View Receipt"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column - Recent Activity */}
        <div className="system-card">
          <h2 className="system-card-title">Recent Activity</h2>
          <ul className="system-audit-list">
            {recentActivity.length === 0 && (
              <li className="system-merchant-empty">No recent activity.</li>
            )}
            {recentActivity.map((entry) => (
              <li
                key={entry.id}
                className={`system-audit-item ${ACTIVITY_BORDER_STYLES[entry.status] || "system-audit-item-primary"}`}
              >
                <div className="system-audit-header">
                  <p className="system-audit-title">
                    {entry.user} purchased {entry.voucher}
                  </p>
                  <span className="system-audit-time">{entry.time}</span>
                </div>
                <p className="system-audit-body">
                  {entry.points} points redeemed
                </p>
                <div className="system-audit-footer">
                  <span className="system-audit-type">Order</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

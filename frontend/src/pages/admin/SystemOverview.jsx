import { useState, useEffect } from "react";
import { Bell, Users, ShoppingBag, Ticket, Star, Eye } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const ACTIVITY_BORDER_STYLES = {
  danger: "system-audit-item-danger",
  success: "system-audit-item-success",
  primary: "system-audit-item-primary",
  warning: "system-audit-item-warning",
};

// Mock growth projection (you can make this dynamic later)
const GROWTH_PROJECTION = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 3000 },
  { month: "Mar", value: 5000 },
  { month: "Apr", value: 4500 },
  { month: "May", value: 6000 },
  { month: "Jun", value: 5500 },
];

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
    { label: "Total Users", value: kpis.totalUsers, delta: `${kpis.activeUsers} active`, icon: Users },
    { label: "Total Unique Orders", value: kpis.totalOrders, delta: "All time", icon: ShoppingBag },
    { label: "Total Vouchers", value: kpis.totalVouchers, delta: `${kpis.activeVouchers} active`, icon: Ticket },
    { label: "Points Redeemed", value: kpis.totalPointsRedeemed.toLocaleString(), delta: "All time", icon: Star },
  ];

  if (loading) {
    return (
      <section className="p-6">
        <p className="text-gray-500">Loading dashboard...</p>
      </section>
    );
  }

  return (
    <section>
      <div className="system-header">
        <div>
          <h1 className="system-title">System Overview</h1>
          <p className="system-subtitle">Real-time snapshot of platform health and activity.</p>
        </div>
        <div className="system-header-actions">
          <span className="system-live-badge">
            <span className="system-live-dot" aria-hidden="true" />
            System Live
          </span>
          <button type="button" aria-label="View notifications" className="system-notification-button">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="system-kpi-grid">
        {kpiStats.map(({ label, value, delta, icon: Icon }) => (
          <div key={label} className="system-kpi-card">
            <div className="system-kpi-icon">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="system-kpi-value">{value}</p>
            <p className="system-kpi-label">{label}</p>
            <p className="system-kpi-delta">{delta}</p>
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

          <div className="system-growth-card">
            <h2 className="system-growth-title">Growth Projection</h2>
            <p className="system-growth-subtitle">
              Projected points redemption volume over the next 6 months.
            </p>
            <div className="system-growth-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={GROWTH_PROJECTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "none", borderRadius: 8, color: "#fff" }} />
                  <Bar dataKey="value" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
              <li key={entry.id} className={`system-audit-item ${ACTIVITY_BORDER_STYLES[entry.status] || "system-audit-item-primary"}`}>
                <div className="system-audit-header">
                  <p className="system-audit-title">{entry.user} purchased {entry.voucher}</p>
                  <span className="system-audit-time">{entry.time}</span>
                </div>
                <p className="system-audit-body">{entry.points} points redeemed</p>
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
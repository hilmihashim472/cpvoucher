import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { KPI_STATS, PENDING_ORDERS, GROWTH_PROJECTION, RECENT_ACTIVITY } from "./mockData";

const ACTIVITY_BORDER_STYLES = {
  danger: "system-audit-item-danger",
  success: "system-audit-item-success",
  primary: "system-audit-item-primary",
  warning: "system-audit-item-warning",
};

export default function SystemOverview() {
  const [pendingOrders, setPendingOrders] = useState(PENDING_ORDERS);

  const handleDecision = (id) => {
    setPendingOrders((items) => items.filter((item) => item.id !== id));
  };

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
        {KPI_STATS.map(({ label, value, delta, icon: Icon }) => (
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
              <h2 className="system-card-title">Pending Orders</h2>
              <a href="/admin/orders" className="system-view-all-link">
                View All
              </a>
            </div>
            <ul className="system-merchant-list">
              {pendingOrders.length === 0 && (
                <li className="system-merchant-empty">No pending orders. All caught up!</li>
              )}
              {pendingOrders.map((order) => (
                <li key={order.id} className="system-merchant-item">
                  <div className="system-merchant-info">
                    <div className="system-merchant-avatar" aria-hidden="true">
                      {order.user.charAt(0)}
                    </div>
                    <div className="system-merchant-details">
                      <p className="system-merchant-name">{order.user}</p>
                      <p className="system-merchant-deal">
                        {order.voucher} · {order.points} pts
                      </p>
                    </div>
                  </div>
                  <div className="system-merchant-actions">
                    <button
                      type="button"
                      aria-label={`Cancel order from ${order.user}`}
                      onClick={() => handleDecision(order.id)}
                      className="system-reject-button"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Fulfil order from ${order.user}`}
                      onClick={() => handleDecision(order.id)}
                      className="system-approve-button"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
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
            {RECENT_ACTIVITY.map((entry) => (
              <li key={entry.id} className={`system-audit-item ${ACTIVITY_BORDER_STYLES[entry.tone]}`}>
                <div className="system-audit-header">
                  <p className="system-audit-title">{entry.title}</p>
                  <span className="system-audit-time">{entry.time}</span>
                </div>
                <p className="system-audit-body">{entry.body}</p>
                <div className="system-audit-footer">
                  <span className="system-audit-type">{entry.type}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import toast from "react-hot-toast";
import { SlidersHorizontal, Download, Plus } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ANALYTICS_KPIS,
  REDEMPTION_TRENDS,
  TOP_VOUCHERS,
  CATEGORY_DISTRIBUTION,
  REALTIME_METRICS,
  PIE_COLORS,
} from "./mockData";

const CATEGORY_FILTERS = ["All Categories", "Electronics", "Food & Wine", "Travel"];

const METRIC_TONE_STYLES = {
  warning: "analytics-metric-fill-warning",
  success: "analytics-metric-fill-success",
  primary: "analytics-metric-fill-primary",
};

export default function AnalyticsReports() {
  const [activeFilter, setActiveFilter] = useState("All Categories");

  return (
    <section>
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Analytics & Reports</h2>
          <p className="analytics-subtitle">
            Deep dive into platform performance and redemption trends.
          </p>
        </div>
        <div className="analytics-header-actions">
          <button type="button" className="analytics-filter-button">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Advanced Filters
          </button>
          <button type="button" className="analytics-export-button">
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Report
          </button>
        </div>
      </div>

      {/* Category filter chips + period selector */}
      <div className="analytics-toolbar">
        <div className="analytics-filter-chips scrollbar-hide">
          {CATEGORY_FILTERS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveFilter(label)}
              aria-pressed={activeFilter === label}
              className={`analytics-filter-chip ${
                activeFilter === label ? "analytics-filter-chip-active" : "analytics-filter-chip-inactive"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="analytics-period">
          <span className="analytics-period-label">Period</span>
          <label className="sr-only" htmlFor="period-start">
            Start date
          </label>
          <input
            id="period-start"
            type="date"
            defaultValue="2026-05-01"
            className="analytics-period-input"
          />
          <span aria-hidden="true">–</span>
          <label className="sr-only" htmlFor="period-end">
            End date
          </label>
          <input
            id="period-end"
            type="date"
            defaultValue="2026-06-01"
            className="analytics-period-input"
          />
        </div>
      </div>

      {/* KPI metric cards */}
      <div className="analytics-kpi-grid">
        {ANALYTICS_KPIS.map(({ label, value, delta, trend }) => (
          <div key={label} className="analytics-kpi-card">
            <p className="analytics-kpi-label">{label}</p>
            <div className="analytics-kpi-row">
              <p className="analytics-kpi-value">{value}</p>
              <span
                className={`analytics-kpi-delta ${
                  trend === "up" ? "analytics-kpi-delta-up" : "analytics-kpi-delta-down"
                }`}
              >
                {delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="analytics-charts-row">
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Redemption Trends</h3>
          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REDEMPTION_TRENDS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0" }} />
                <Line type="monotone" dataKey="redemptions" stroke="#1A56DB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Top Vouchers</h3>
          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_VOUCHERS} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0" }} />
                <Bar dataKey="value" fill="#1A56DB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="analytics-charts-row">
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Category Distribution</h3>
          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_DISTRIBUTION} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Real-time Performance</h3>
          <div className="analytics-metrics-list">
            {REALTIME_METRICS.map((metric) => (
              <div key={metric.label}>
                <div className="analytics-metric-row">
                  <span className="analytics-metric-label">{metric.label}</span>
                  <span className="analytics-metric-value">
                    {metric.value}
                    {metric.unit}
                  </span>
                </div>
                <div className="analytics-metric-track">
                  <div
                    className={`analytics-metric-fill ${METRIC_TONE_STYLES[metric.tone]}`}
                    style={{ width: `${metric.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => toast("Custom metric cards are coming soon!")}
            className="analytics-add-metric-button"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Custom Metric Card
          </button>
        </div>
      </div>
    </section>
  );
}

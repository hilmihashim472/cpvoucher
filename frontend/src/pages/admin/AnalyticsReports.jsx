import { useState, useEffect } from "react";
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
import { useAuth } from "../../hooks/useAuth";

const PIE_COLORS = ["#1A56DB", "#F97316", "#10B981", "#1E293B", "#94A3B8"];

const METRIC_TONE_STYLES = {
  warning: "analytics-metric-fill-warning",
  success: "analytics-metric-fill-success",
  primary: "analytics-metric-fill-primary",
  danger: "analytics-metric-fill-danger",
};

export default function AnalyticsReports() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([]);
  const [redemptionTrends, setRedemptionTrends] = useState([]);
  const [topVouchers, setTopVouchers] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [realtimeMetrics, setRealtimeMetrics] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/admin/analytics");
        setKpis(data.kpis || []);
        setRedemptionTrends(data.redemptionTrends || []);
        setTopVouchers(data.topVouchers || []);
        setCategoryDistribution(data.categoryDistribution || []);
        setRealtimeMetrics(data.realtimeMetrics || []);
      } catch (error) {
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [api]);

  if (loading) {
    return (
      <section className="p-6">
        <p className="text-gray-500">Loading analytics...</p>
      </section>
    );
  }

  return (
    <section>
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Analytics & Reports</h2>
          <p className="analytics-subtitle">
            Deep dive into platform performance and redemption trends.
          </p>
        </div>
      </div>

      {/* KPI metric cards */}
      <div className="analytics-kpi-grid">
        {kpis.map(({ label, value, delta, trend, subtitle }) => (
          <div key={label} className="analytics-kpi-card">
            <p className="analytics-kpi-label">{label}</p>
            {subtitle && <p className="analytics-kpi-subtitle">{subtitle}</p>}
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
              <LineChart data={redemptionTrends}>
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
              <BarChart data={topVouchers} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0" }}
                  formatter={(value, name) => [value, "Total Vouchers Redeemed"]}
                />
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
                <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {categoryDistribution.map((entry, index) => (
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
            {realtimeMetrics.map((metric) => (
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

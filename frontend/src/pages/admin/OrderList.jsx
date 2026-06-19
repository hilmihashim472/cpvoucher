import { useState } from "react";
import { Search, Download, Eye } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { MOCK_ORDERS, ORDER_KPI_STATS } from "./mockData";

const STATUS_FILTERS = ["All", "Pending", "Completed", "Cancelled", "Refunded"];

const STATUS_STYLES = {
  completed: "olist-status-completed",
  pending: "olist-status-pending",
  cancelled: "olist-status-cancelled",
  refunded: "olist-status-refunded",
};

export default function OrderList() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.toLowerCase().includes(search.toLowerCase()) ||
      o.voucher.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || o.status === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-content">
        <main className="admin-main">
          <div className="olist-header">
            <div>
              <h1 className="olist-title">Order Management</h1>
              <p className="olist-subtitle">Track and manage all voucher redemption orders.</p>
            </div>
            <button type="button" className="olist-export-button">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </button>
          </div>

          <div className="olist-kpi-grid">
            {ORDER_KPI_STATS.map((stat) => (
              <div key={stat.label} className="olist-kpi-card">
                <p className="olist-kpi-value">{stat.value}</p>
                <p className="olist-kpi-label">{stat.label}</p>
                <p className="olist-kpi-delta">{stat.delta}</p>
              </div>
            ))}
          </div>

          <div className="olist-toolbar">
            <label className="olist-search-label" aria-label="Search orders">
              <Search className="olist-search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search by order ID, user, or voucher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="olist-search-input"
              />
            </label>
            <div className="olist-filter-tabs" role="tablist" aria-label="Filter by status">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={activeFilter === f}
                  onClick={() => setActiveFilter(f)}
                  className={`olist-filter-tab ${activeFilter === f ? "olist-filter-tab-active" : "olist-filter-tab-inactive"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="olist-table-card">
            <div className="olist-table-scroll">
              <table className="olist-table" aria-label="Order list">
                <thead className="olist-table-head">
                  <tr>
                    <th className="olist-th">Order ID</th>
                    <th className="olist-th">User</th>
                    <th className="olist-th">Voucher</th>
                    <th className="olist-th">Points</th>
                    <th className="olist-th">Status</th>
                    <th className="olist-th">Date</th>
                    <th className="olist-th sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="olist-table-body">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="olist-empty-cell">
                        No orders match your search.
                      </td>
                    </tr>
                  )}
                  {filtered.map((o) => (
                    <tr key={o.id} className="olist-row">
                      <td className="olist-td-id">{o.id}</td>
                      <td className="olist-td">{o.user}</td>
                      <td className="olist-td-voucher">{o.voucher}</td>
                      <td className="olist-td-points">{o.points.toLocaleString()} pts</td>
                      <td className="olist-td">
                        <span className={`olist-status-badge ${STATUS_STYLES[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="olist-td">{o.date}</td>
                      <td className="olist-td">
                        <div className="olist-actions-row">
                          <button
                            type="button"
                            aria-label={`View order ${o.id}`}
                            className="olist-action-button"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="olist-footer">
              <span className="olist-footer-count">
                {filtered.length} order{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </main>

        <footer className="admin-footer">
          <div className="admin-footer-inner">
            <span>VoucherPro Admin v2.4.1 Build 9982</span>
            <nav aria-label="Admin footer links" className="admin-footer-nav">
              <a href="#" className="admin-footer-link">Documentation</a>
              <a href="#" className="admin-footer-link">Support Ticket</a>
              <button type="button" className="admin-footer-logout">Logout</button>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}

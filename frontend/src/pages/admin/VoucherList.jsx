import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { MOCK_VOUCHERS } from "./mockData";

const STATUS_FILTERS = ["All", "Active", "Expired", "Draft"];

const STATUS_STYLES = {
  active: "vlist-badge-active",
  expired: "vlist-badge-expired",
  draft: "vlist-badge-draft",
};

export default function VoucherList() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = MOCK_VOUCHERS.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || v.status === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-content">
        <main className="admin-main">
          <div className="vlist-header">
            <div>
              <h1 className="vlist-title">Voucher Management</h1>
              <p className="vlist-subtitle">Browse, edit, and publish vouchers across all merchants.</p>
            </div>
            <Link to="/admin/vouchers/add" className="vlist-add-button">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Voucher
            </Link>
          </div>

          <div className="vlist-toolbar">
            <label className="vlist-search-label" aria-label="Search vouchers">
              <Search className="vlist-search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search by title or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="vlist-search-input"
              />
            </label>
            <div className="vlist-filter-tabs" role="tablist" aria-label="Filter by status">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={activeFilter === f}
                  onClick={() => setActiveFilter(f)}
                  className={`vlist-filter-tab ${activeFilter === f ? "vlist-filter-tab-active" : "vlist-filter-tab-inactive"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="vlist-table-card">
            <div className="vlist-table-scroll">
              <table className="vlist-table" aria-label="Voucher list">
                <thead className="vlist-table-head">
                  <tr>
                    <th className="vlist-th">Voucher</th>
                    <th className="vlist-th">Category</th>
                    <th className="vlist-th">Points</th>
                    <th className="vlist-th">Uses</th>
                    <th className="vlist-th">Status</th>
                    <th className="vlist-th">Expiry</th>
                    <th className="vlist-th sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="vlist-table-body">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="vlist-empty-cell">
                        No vouchers match your search.
                      </td>
                    </tr>
                  )}
                  {filtered.map((v) => (
                    <tr key={v.id} className="vlist-row">
                      <td className="vlist-td-title">{v.title}</td>
                      <td className="vlist-td">
                        <span className="vlist-category-badge">{v.category}</span>
                      </td>
                      <td className="vlist-td vlist-td-points">{v.points.toLocaleString()} pts</td>
                      <td className="vlist-td">{v.uses.toLocaleString()}</td>
                      <td className="vlist-td">
                        <span className={`vlist-status-badge ${STATUS_STYLES[v.status]}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="vlist-td">{v.expiry}</td>
                      <td className="vlist-td">
                        <div className="vlist-actions-row">
                          <button
                            type="button"
                            aria-label={`View ${v.title}`}
                            className="vlist-action-button"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit ${v.title}`}
                            className="vlist-action-button"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${v.title}`}
                            className="vlist-action-button vlist-action-delete"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="vlist-footer">
              <span className="vlist-footer-count">
                {filtered.length} voucher{filtered.length !== 1 ? "s" : ""}
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

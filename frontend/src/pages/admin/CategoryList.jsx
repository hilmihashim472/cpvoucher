import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { MOCK_CATEGORIES } from "./mockData";

const STATUS_FILTERS = ["All", "Active", "Draft"];

export default function CategoryList() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = MOCK_CATEGORIES.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || cat.status === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-content">
        <main className="admin-main">
          <div className="clist-header">
            <div>
              <h1 className="clist-title">Category Management</h1>
              <p className="clist-subtitle">
                Organise vouchers into browsable categories for users.
              </p>
            </div>
            <Link to="/admin/categories/add" className="clist-add-button">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Category
            </Link>
          </div>

          <div className="clist-toolbar">
            <label className="clist-search-label" aria-label="Search categories">
              <Search className="clist-search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search by name or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="clist-search-input"
              />
            </label>
            <div className="clist-filter-tabs" role="tablist" aria-label="Filter by status">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={activeFilter === f}
                  onClick={() => setActiveFilter(f)}
                  className={`clist-filter-tab ${
                    activeFilter === f
                      ? "clist-filter-tab-active"
                      : "clist-filter-tab-inactive"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="clist-table-card">
            <div className="clist-table-scroll">
              <table className="clist-table" aria-label="Category list">
                <thead className="clist-table-head">
                  <tr>
                    <th className="clist-th">Category</th>
                    <th className="clist-th">Vouchers</th>
                    <th className="clist-th">Status</th>
                    <th className="clist-th sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="clist-table-body">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="clist-empty-cell">
                        No categories match your search.
                      </td>
                    </tr>
                  )}
                  {filtered.map((cat) => (
                    <tr key={cat.id} className="clist-row">
                      <td className="clist-td-name">
                        <div className="clist-name-row">
                          <div
                            className="clist-color-dot"
                            style={{ backgroundColor: cat.color }}
                            aria-hidden="true"
                          />
                          <div>
                            <p className="clist-name-text">{cat.name}</p>
                            <p className="clist-desc-text">{cat.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="clist-td-count">
                        {cat.voucherCount.toLocaleString()}
                      </td>
                      <td className="clist-td">
                        <span
                          className={`clist-status-badge ${
                            cat.status === "active"
                              ? "clist-badge-active"
                              : "clist-badge-draft"
                          }`}
                        >
                          {cat.status}
                        </span>
                      </td>
                      <td className="clist-td">
                        <div className="clist-actions-row">
                          <button
                            type="button"
                            aria-label={`Edit ${cat.name}`}
                            className="clist-action-button"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${cat.name}`}
                            className="clist-action-button clist-action-delete"
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
            <div className="clist-footer">
              <span className="clist-footer-count">
                {filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}
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

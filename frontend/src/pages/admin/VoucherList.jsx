import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import InlineError from "../../components/InlineError";
import API_BASE_URL from "../../config/api";

const STATUS_STYLES = {
  active: "vlist-badge-active",
  expired: "vlist-badge-expired",
  draft: "vlist-badge-draft",
};

export default function VoucherList() {
  const [search, setSearch] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/vouchers`)
      .then((res) => {
        setVouchers(Array.isArray(res.data) ? res.data : []);
        setError(null);
      })
      .catch(() => {
        setError("Unable to load vouchers");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = vouchers.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.category?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
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
              <button
                role="tab"
                aria-selected={true}
                className={`vlist-filter-tab vlist-filter-tab-active`}
              >
                All
              </button>
            </div>
          </div>

          <div className="vlist-table-card">
            {loading ? (
              <div className="vlist-table-loading">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="vlist-table-skeleton-row" />
                ))}
              </div>
            ) : error ? (
              <div className="vlist-table-padding">
                <InlineError message={error} />
              </div>
            ) : (
              <div className="vlist-table-scroll">
                <table className="vlist-table" aria-label="Voucher list">
                  <thead className="vlist-table-head">
                    <tr>
                      <th className="vlist-th">Voucher</th>
                      <th className="vlist-th">Category</th>
                      <th className="vlist-th">Points</th>
                      <th className="vlist-th">Brand</th>
                      <th className="vlist-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="vlist-table-body">
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="vlist-empty-cell">
                          No vouchers match your search.
                        </td>
                      </tr>
                    )}
                    {filtered.map((v) => (
                      <tr key={v._id} className="vlist-row">
                        <td className="vlist-td-title">{v.title}</td>
                        <td className="vlist-td">
                          <span className="vlist-category-badge">{v.category?.name || "General"}</span>
                        </td>
                        <td className="vlist-td vlist-td-points">{v.points.toLocaleString()} pts</td>
                        <td className="vlist-td">{v.brand}</td>
                        <td className="vlist-td">
                          <div className="vlist-actions-row">
                            <Link to={`/vouchers/${v._id}`} className="vlist-action-button" aria-label={`View ${v.title}`}>
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <Link to={`/admin/vouchers/add?id=${v._id}`} className="vlist-action-button" aria-label={`Edit ${v.title}`}>
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              aria-label={`Delete ${v.title}`}
                              className="vlist-action-button vlist-action-delete"
                              onClick={() => {
                                if (window.confirm(`Delete "${v.title}"?`)) {
                                  axios.delete(`${API_BASE_URL}/vouchers/${v._id}`).then(() => {
                                    setVouchers(vouchers.filter(item => item._id !== v._id));
                                    toast.success("Voucher deleted");
                                  }).catch(() => toast.error("Failed to delete"));
                                }
                              }}
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
            )}
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

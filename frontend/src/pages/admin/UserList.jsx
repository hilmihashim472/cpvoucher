import { useState } from "react";
import { Search, UserPlus, Pencil, Ban, Eye } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { MOCK_USERS } from "./mockData";

const ROLE_FILTERS = ["All", "User", "Admin"];

const ROLE_STYLES = {
  admin: "ulist-role-admin",
  user: "ulist-role-user",
};

const STATUS_STYLES = {
  active: "ulist-status-active",
  suspended: "ulist-status-suspended",
};

export default function UserList() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = MOCK_USERS.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || u.role === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-content">
        <main className="admin-main">
          <div className="ulist-header">
            <div>
              <h1 className="ulist-title">User Management</h1>
              <p className="ulist-subtitle">View, manage, and moderate all registered users.</p>
            </div>
            <button type="button" className="ulist-invite-button">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Invite User
            </button>
          </div>

          <div className="ulist-toolbar">
            <label className="ulist-search-label" aria-label="Search users">
              <Search className="ulist-search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ulist-search-input"
              />
            </label>
            <div className="ulist-filter-tabs" role="tablist" aria-label="Filter by role">
              {ROLE_FILTERS.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={activeFilter === f}
                  onClick={() => setActiveFilter(f)}
                  className={`ulist-filter-tab ${activeFilter === f ? "ulist-filter-tab-active" : "ulist-filter-tab-inactive"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="ulist-table-card">
            <div className="ulist-table-scroll">
              <table className="ulist-table" aria-label="User list">
                <thead className="ulist-table-head">
                  <tr>
                    <th className="ulist-th">User</th>
                    <th className="ulist-th">Points</th>
                    <th className="ulist-th">Role</th>
                    <th className="ulist-th">Status</th>
                    <th className="ulist-th">Joined</th>
                    <th className="ulist-th sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="ulist-table-body">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="ulist-empty-cell">
                        No users match your search.
                      </td>
                    </tr>
                  )}
                  {filtered.map((u) => (
                    <tr key={u.id} className="ulist-row">
                      <td className="ulist-td-user">
                        <div className="ulist-user-row">
                          <div className="ulist-avatar" aria-hidden="true">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="ulist-user-name">{u.name}</p>
                            <p className="ulist-user-email">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="ulist-td-points">{u.points.toLocaleString()} pts</td>
                      <td className="ulist-td">
                        <span className={`ulist-role-badge ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="ulist-td">
                        <span className={`ulist-status-badge ${STATUS_STYLES[u.status]}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="ulist-td">{u.joined}</td>
                      <td className="ulist-td">
                        <div className="ulist-actions-row">
                          <button
                            type="button"
                            aria-label={`View ${u.name}`}
                            className="ulist-action-button"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit ${u.name}`}
                            className="ulist-action-button"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={u.status === "suspended" ? `Unsuspend ${u.name}` : `Suspend ${u.name}`}
                            className="ulist-action-button ulist-action-danger"
                          >
                            <Ban className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ulist-footer">
              <span className="ulist-footer-count">
                {filtered.length} user{filtered.length !== 1 ? "s" : ""}
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

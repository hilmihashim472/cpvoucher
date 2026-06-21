import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Ticket,
  Users,
  Tag,
  Plus,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Vouchers", icon: Ticket, to: "/admin/vouchers" },
  { label: "Categories", icon: Tag, to: "/admin/categories" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Orders", icon: ShoppingBag, to: "/admin/orders" },
];

export default function Sidebar({ sessionCount = 1 }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const isActive = (to) =>
    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-row">
        <div className="sidebar-logo">VH</div>
        <div>
          <p className="sidebar-logo-title">Admin Console</p>
          <p className="sidebar-logo-subtitle">System Oversight</p>
        </div>
      </div>

      <div className="sidebar-user-row">
        <div className="sidebar-user-avatar">{user.name?.charAt(0) ?? "A"}</div>
        <div>
          <p className="sidebar-user-name">{user.name}</p>
          <p className="sidebar-user-role">Administrator</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            aria-current={isActive(to) ? "page" : undefined}
            className={`sidebar-nav-link ${isActive(to) ? "sidebar-nav-link-active" : "sidebar-nav-link-inactive"}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-new-campaign-button">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Campaign
        </button>
        <p className="sidebar-session-count">
          {sessionCount} active session{sessionCount === 1 ? "" : "s"}
        </p>
      </div>
    </aside>
  );
}

import { Link, useLocation } from "react-router-dom";
import {
  Tag, Ticket, LayoutDashboard, ShoppingBag, Users,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

const NAV_ITEMS = [
  { label: "Categories",    icon: Tag,             to: "/admin/categories" },
  { label: "Vouchers",      icon: Ticket,          to: "/admin/vouchers"   },
  { label: "Dashboard",     icon: LayoutDashboard, to: "/admin"            },
  { label: "Orders",        icon: ShoppingBag,     to: "/admin/orders"     },
  { label: "Users",         icon: Users,           to: "/admin/users"      },
];

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
];

const getGradient = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

export default function AdminMobileNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const displayName = user?.fullName || user?.username || "Admin";
  const gradient = getGradient(displayName);

  const isActive = (to) =>
    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <header className="amnav-topbar">
        <div className="amnav-topbar-inner">
          {/* Logo */}
          <Link to="/admin" className="amnav-topbar-logo">
            <div className="amnav-topbar-logo-icon">CB</div>
            <span className="amnav-topbar-logo-text">Carter Bank Voucher Administration</span>
          </Link>

          {/* Profile link */}
          <Link to="/admin/profile" className="amnav-topbar-avatar" aria-label="My profile">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={displayName}
                className="amnav-topbar-avatar-img"
              />
            ) : (
              <div className={`amnav-topbar-avatar-placeholder bg-gradient-to-br ${gradient}`}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="amnav-bottom" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
          const active = isActive(to);
          return (
            <Link
              key={label}
              to={to}
              aria-current={active ? "page" : undefined}
              className={`amnav-bottom-item ${active ? "amnav-bottom-item-active" : ""}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="amnav-bottom-label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

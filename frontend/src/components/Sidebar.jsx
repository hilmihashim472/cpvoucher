import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Ticket,
  Users,
  User,
  Tag,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import AdminMobileNav from "./AdminMobileNav";

/* ──────────────────────────────────────────────
   NAVIGATION — arranged by logical flow:
   Overview → Products → Organization → Transactions → People
   ────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Categories", icon: Tag, to: "/admin/categories" },
  { label: "Vouchers", icon: Ticket, to: "/admin/vouchers" },
  { label: "Order History", icon: ShoppingBag, to: "/admin/orders" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Profile", icon: User, to: "/admin/profile" },
];

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
];

const getGradient = (name) => {
  if (!name) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar when route changes (mobile UX)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (to) =>
    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName = user?.fullName || user?.username || "Admin";
  const displayEmail = user?.email || "";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile top + bottom nav (replaces hamburger on small screens) */}
      <AdminMobileNav />

      {/* ── MOBILE HAMBURGER BUTTON — desktop fallback only ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="hidden fixed top-4 left-4 z-40 p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* ── MOBILE BACKDROP ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          h-screen w-72 bg-white border-r border-gray-100
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── LOGO ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div className="flex-1 flex flex-col items-center gap-1">
            <Link to="/admin" className="flex flex-col items-center gap-1">
              <img src="/cbvnavbar.svg" alt="Carter Bank Voucher" className="h-9 w-auto" />
              <span className="text-xs font-extrabold tracking-tight text-[#1a56db]">Administrator</span>
            </Link>
          </div>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-gray-100" />

        {/* ── PROFILE CARD ── */}
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={displayName}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGradient(displayName)} flex items-center justify-center text-white font-bold text-lg shadow-sm ring-2 ring-white`}>
                {avatarInitial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
            </div>
            <Link
              to="/admin/profile"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
              aria-label="Profile settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* ── NAVIGATION ── */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
            const active = isActive(to);
            return (
              <Link
                key={label}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`
                  group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? "sidebar-nav-link-active"
                    : "sidebar-nav-link-inactive"
                  }
                `}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${active ? "text-white-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── LOGOUT SECTION ── */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-4.5 w-4.5 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* Hide desktop sidebar on mobile (AdminMobileNav handles mobile nav) */}
    </>
  );
}
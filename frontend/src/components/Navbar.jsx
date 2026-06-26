import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Coins, User, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import BottomNav from "./BottomNav";

const NAV_LINKS = [
  { label: "Home", to: "/home" },
  { label: "Categories", to: "/categories" },
  { label: "Orders", to: "/orders-history" },
];

const SIMPLE_NAV_LINKS = [
  { label: "Browse Vouchers", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Deals", to: "/" },
];

export default function Navbar({ variant = "default" }) {
  const { user, logout, api } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (to) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  const loadCartCount = useCallback(() => {
    if (variant !== "default") return;
    api
      .get("/cart")
      .then((res) => {
        const items = Array.isArray(res.data)
          ? res.data
          : (res.data?.items ?? []);
        const totalQuantity = items.reduce(
          (sum, item) => sum + (item.id ?? 1),
          0,
        );
        setCartCount(totalQuantity);
      })
      .catch(() => setCartCount(0));
  }, [variant, api]);

  useEffect(() => {
    if (variant !== "default") return;
    loadCartCount();
    window.addEventListener("cartUpdated", loadCartCount);
    return () => window.removeEventListener("cartUpdated", loadCartCount);
  }, [loadCartCount, variant]);

  const links = variant === "default" ? NAV_LINKS : SIMPLE_NAV_LINKS;

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-bar">
            {/* Logo — always visible */}
            <Link
              to={variant === "default" ? "/home" : "/"}
              className="navbar-logo"
            >
              <img
                src="/cbvnavbar.svg"
                alt="Carter Bank Voucher"
                className="navbar-logo-img"
              />
            </Link>

            {/* Desktop nav links */}
            <nav className="navbar-links">
              {links.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className={`navbar-link ${isActive(to) ? "navbar-link-active" : "navbar-link-inactive"}`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop search */}
            {variant === "default" && (
              <div className="navbar-search">
                <label className="navbar-search-label">
                  <span className="sr-only">Search vouchers</span>
                  <Search className="navbar-search-icon" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search vouchers, brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const query = searchQuery.trim();
                        navigate(
                          query
                            ? `/categories?search=${encodeURIComponent(query)}`
                            : "/categories",
                        );
                      }
                    }}
                    className="navbar-search-input"
                  />
                </label>
              </div>
            )}

            <div className="navbar-actions">
              {variant === "default" ? (
                <>
                  {/* Points badge — visible on all screen sizes */}
                  <div
                    className="navbar-points-badge"
                    aria-label={`${user?.points ?? 0} points`}
                  >
                    <Coins className="navbar-points-icon" aria-hidden="true" />
                    <span className="navbar-points-text">
                      {(user?.points ?? 0).toLocaleString()} pts
                    </span>
                  </div>

                  {/* Cart + Avatar — desktop only (bottom nav handles mobile) */}
                  <div className="hidden lg:flex items-center gap-3">
                    <Link
                      to="/cart"
                      aria-label={`View cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
                      className="navbar-cart-link"
                    >
                      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                      {cartCount > 0 && (
                        <span className="navbar-cart-badge">{cartCount}</span>
                      )}
                    </Link>

                    <div className="navbar-profile-dropdown">
                      <button
                        type="button"
                        onClick={() =>
                          setProfileDropdownOpen(!profileDropdownOpen)
                        }
                        aria-label="Open profile menu"
                        aria-expanded={profileDropdownOpen}
                        className="navbar-avatar"
                      >
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt=""
                            className="navbar-avatar-image"
                          />
                        ) : (
                          (user?.name?.charAt(0) ?? "U")
                        )}
                      </button>
                      {profileDropdownOpen && (
                        <div className="navbar-dropdown-menu">
                          <div className="navbar-dropdown-header">
                            <p className="navbar-dropdown-name">{user?.name}</p>
                            <p className="navbar-dropdown-email">
                              {user?.email}
                            </p>
                          </div>
                          <div className="navbar-dropdown-divider" />
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="navbar-dropdown-item"
                          >
                            <User className="h-4 w-4" aria-hidden="true" />
                            <span>Profile</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                              window.location.replace("/");
                            }}
                            className="navbar-dropdown-item navbar-dropdown-logout"
                          >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : user ? (
                <div className="navbar-auth-buttons">
                  <Link to="/cart" className="navbar-login-button">
                    Cart
                  </Link>
                  <Link to="/profile" className="navbar-signup-button">
                    Profile
                  </Link>
                </div>
              ) : (
                <div className="navbar-auth-buttons">
                  <Link to="/login" className="navbar-login-button">
                    Login
                  </Link>
                  <Link to="/register" className="navbar-signup-button">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation — only for logged-in user pages */}
      {variant === "default" && <BottomNav />}
    </>
  );
}

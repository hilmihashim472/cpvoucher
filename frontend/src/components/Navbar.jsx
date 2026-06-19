import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bell, ShoppingCart, Menu, X } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import useAuth from "../hooks/useAuth";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Orders", to: "/orders" },
];

const SIMPLE_NAV_LINKS = [
  { label: "Browse Vouchers", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Deals", to: "/" },
];

export default function Navbar({ variant = "default" }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  useEffect(() => {
    if (variant !== "default") return;
    let isMounted = true;

    axios
      .get(`${API_BASE_URL}/cart`)
      .then((res) => {
        if (!isMounted) return;
        const items = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
        setCartCount(items.length);
      })
      .catch(() => {
        if (isMounted) setCartCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, [variant]);

  const links = variant === "default" ? NAV_LINKS : SIMPLE_NAV_LINKS;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-bar">
          <Link to="/" className="navbar-logo">
            VoucherHub
          </Link>

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

          {variant === "default" && (
            <div className="navbar-search">
              <label className="navbar-search-label">
                <span className="sr-only">Search vouchers</span>
                <Search className="navbar-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search vouchers, brands..."
                  className="navbar-search-input"
                />
              </label>
            </div>
          )}

          <div className="navbar-actions">
            {variant === "default" ? (
              <>
                <button
                  type="button"
                  aria-label="View notifications"
                  className="navbar-icon-button"
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </button>
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
                <Link
                  to="/profile"
                  aria-label={`${user.name}'s profile`}
                  className="navbar-avatar"
                >
                  {user.name?.charAt(0) ?? "U"}
                </Link>
              </>
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

            <button
              type="button"
              className="navbar-menu-button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="navbar-mobile-menu">
            {variant === "default" && (
              <label className="navbar-mobile-search-label">
                <span className="sr-only">Search vouchers</span>
                <Search className="navbar-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search vouchers, brands..."
                  className="navbar-search-input"
                />
              </label>
            )}
            <nav className="navbar-mobile-nav">
              {links.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`navbar-mobile-link ${isActive(to) ? "navbar-link-active" : ""}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
            {variant === "simple" && (
              <div className="navbar-mobile-auth">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="navbar-mobile-login-button"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="navbar-mobile-signup-button"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

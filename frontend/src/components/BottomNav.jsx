import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, LayoutGrid, Home, ShoppingCart, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

const NAV_ITEMS = [
  { label: "Orders",     icon: ShoppingBag,  to: "/orders-history" },
  { label: "Categories", icon: LayoutGrid,   to: "/categories" },
  { label: "Home",       icon: Home,         to: "/home" },
  { label: "Cart",       icon: ShoppingCart, to: "/cart",    isCart: true },
  { label: "Profile",    icon: User,         to: "/profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { api } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = useCallback(() => {
    api
      .get("/cart")
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
        setCartCount(items.length);
      })
      .catch(() => setCartCount(0));
  }, [api]);

  useEffect(() => {
    loadCartCount();
    window.addEventListener("cartUpdated", loadCartCount);
    return () => window.removeEventListener("cartUpdated", loadCartCount);
  }, [loadCartCount]);

  const isActive = (to) =>
    to === "/home" ? pathname === "/home" : pathname.startsWith(to);

  return (
    <nav className="bnav" aria-label="Bottom navigation">
      <div className="bnav-inner">
        {NAV_ITEMS.map(({ label, icon: Icon, to, isCart }) => {
          const active = isActive(to);
          return (
            <Link
              key={label}
              to={to}
              aria-current={active ? "page" : undefined}
              className={`bnav-item ${active ? "bnav-item-active" : ""}`}
            >
              <div className="bnav-icon-wrap">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {isCart && cartCount > 0 && (
                  <span className="bnav-cart-badge" aria-label={`${cartCount} items in cart`}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="bnav-label">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  UtensilsCrossed,
  Laptop,
  Plane,
  ShoppingBag,
  Home as HomeIcon,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import VoucherCard from "../../components/VoucherCard";
import SkeletonCard from "../../components/SkeletonCard";
import InlineError from "../../components/InlineError";
import EmptyState from "../../components/EmptyState";
import API_BASE_URL from "../../config/api";

const CATEGORIES = [
  { key: "All Deals", icon: Sparkles, label: "All Deals", count: 312 },
  { key: "Food", icon: UtensilsCrossed, label: "Food & Drinks", count: 87 },
  { key: "Tech", icon: Laptop, label: "Tech & Gadgets", count: 56 },
  { key: "Travel", icon: Plane, label: "Travel", count: 34 },
  { key: "Fashion", icon: ShoppingBag, label: "Fashion", count: 72 },
  { key: "Home", icon: HomeIcon, label: "Home & Living", count: 28 },
];

export default function Categories() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Deals");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVouchers = useCallback((category) => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/vouchers`, { params: { category } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.vouchers ?? [];
        setVouchers(data);
        setError(null);
      })
      .catch(() => {
        setError("Unable to load vouchers right now. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchVouchers(activeCategory);
  }, [activeCategory, fetchVouchers]);

  const activeMeta = CATEGORIES.find((c) => c.key === activeCategory) ?? CATEGORIES[0];

  return (
    <div className="page-shell">
      <Navbar />

      <section className="cat-hero">
        <div className="cat-hero-inner">
          <h1 className="cat-hero-title">Browse by Category</h1>
          <p className="cat-hero-subtitle">
            Discover exclusive vouchers across food, tech, travel, fashion, and more.
          </p>
        </div>
      </section>

      <main className="cat-main">
        {/* Category cards */}
        <div className="cat-grid" role="list" aria-label="Voucher categories">
          {CATEGORIES.map(({ key, icon: Icon, label, count }) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                role="listitem"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(key)}
                className={`cat-card ${isActive ? "cat-card-active" : ""}`}
              >
                <div className={`cat-card-icon ${isActive ? "cat-card-icon-active" : ""}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="cat-card-name">{label}</p>
                <p className="cat-card-count">{count} vouchers</p>
              </button>
            );
          })}
        </div>

        {/* Vouchers section */}
        <div className="cat-vouchers-section">
          <div className="cat-vouchers-header">
            <div>
              <h2 className="cat-vouchers-title">{activeMeta.label}</h2>
              <p className="cat-vouchers-subtitle">
                {loading ? "Loading…" : `${vouchers.length} voucher${vouchers.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
          </div>

          <div className="cat-vouchers-grid">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

            {!loading && error && (
              <div className="cat-full-width">
                <InlineError message={error} />
              </div>
            )}

            {!loading && !error && vouchers.length === 0 && (
              <div className="cat-full-width">
                <EmptyState
                  title="No vouchers in this category"
                  description="Check back soon — new deals are added regularly."
                />
              </div>
            )}

            {!loading &&
              !error &&
              vouchers.map((voucher) => (
                <VoucherCard
                  key={voucher._id ?? voucher.id}
                  brand={voucher.brand}
                  category={voucher.category}
                  title={voucher.title}
                  description={voucher.description}
                  cost={voucher.cost ?? voucher.points}
                  pointsLabel={voucher.pointsLabel}
                  badge={voucher.badge}
                  onGetCode={() => navigate(`/vouchers/${voucher._id ?? voucher.id}`)}
                />
              ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  UtensilsCrossed,
  Laptop,
  Plane,
  ShoppingBag,
  Home as HomeIcon,
  Tag,
  Dumbbell,
  Car,
  BookOpen,
  Heart,
  Music,
  Coffee,
  Gift,
  Gamepad2,
  Zap,
  Star,
  Baby,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import VoucherCard from "../../components/VoucherCard";
import SkeletonCard from "../../components/SkeletonCard";
import InlineError from "../../components/InlineError";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../hooks/useAuth.jsx";

// Complete icon map with ALL icons from your database
const ICON_MAP = {
  UtensilsCrossed: UtensilsCrossed,
  Laptop: Laptop,
  Plane: Plane,
  ShoppingBag: ShoppingBag,
  Home: HomeIcon,
  Sparkles: Sparkles,
  Tag: Tag,
  Dumbbell: Dumbbell,
  Car: Car,
  BookOpen: BookOpen,
  Heart: Heart,
  Music: Music,
  Coffee: Coffee,
  Gift: Gift,
  Gamepad2: Gamepad2,
  Zap: Zap,
  Star: Star,
  Baby: Baby,
};

const ALL_DEALS = { key: "All Deals", icon: Sparkles, label: "All Deals", color: "#F97316" };

export default function Categories() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All Deals");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [categories, setCategories] = useState([ALL_DEALS]);

  const fetchCategories = useCallback(() => {
    api
      .get("/categories")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.categories ?? []);

        // Filter to only show active categories
        const activeCategories = data.filter(cat => cat.status === "active");

        if (activeCategories.length > 0) {
          const dynamicCategories = activeCategories.map((cat) => ({
            key: cat.slug,
            label: cat.name,
            icon: ICON_MAP[cat.icon] || Tag,
            color: cat.color || "#F97316", // Use color from database
          }));
          setCategories([ALL_DEALS, ...dynamicCategories]);
        } else {
          setCategories([ALL_DEALS]);
        }
      })
      .catch(() => {
        // Keep default categories on error
      });
  }, [api]);

  const fetchCategoryCounts = useCallback(() => {
    api
      .get("/vouchers/category-counts")
      .then((res) => {
        setCategoryCounts(res.data || {});
      })
      .catch(() => {
        // Silently fail — counts will show as "—"
      });
  }, [api]);

  const fetchVouchers = useCallback((category, sortVal, pageNum, search = "") => {
    setLoading(true);
    const params = {};
    if (category && category !== "All Deals") params.category = category;
    if (sortVal) params.sort = sortVal;
    if (pageNum > 1) params.page = pageNum;
    if (search) params.search = search;
    params.limit = 9;

    api
      .get("/vouchers", { params })
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.vouchers ?? []);
        setVouchers(data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
        setError(null);
      })
      .catch(() => {
        setError("Unable to load vouchers right now. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    fetchCategories();
    fetchCategoryCounts();
  }, [fetchCategories, fetchCategoryCounts]);

  const activeMeta = categories.find((c) => c.key === activeCategory) ?? { label: "All Deals", color: "#F97316" };

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || "All Deals";
    const sortFromUrl = searchParams.get("sort") || "newest";
    const pageFromUrl = parseInt(searchParams.get("page")) || 1;
    const searchFromUrl = searchParams.get("search") || "";

    setActiveCategory(categoryFromUrl);
    setSort(sortFromUrl);
    setPage(pageFromUrl);
    setSearchQuery(searchFromUrl);
    fetchVouchers(categoryFromUrl, sortFromUrl, pageFromUrl, searchFromUrl);
  }, [searchParams, fetchVouchers]);

  const handleCategoryChange = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === "All Deals") {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }
    newParams.delete("page");
    newParams.delete("search");
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    if (newSort === "newest") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", newSort);
    }
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newParams.delete("page");
    } else {
      newParams.set("page", newPage.toString());
    }
    setSearchParams(newParams);
  };

  return (
    <div className="page-shell">
      <Navbar />

      <section className="cat-hero">
        <div className="cat-hero-inner">
          <h1 className="cat-hero-title">Browse by Category</h1>
          <p className="cat-hero-subtitle">
            Discover exclusive vouchers across food, tech, travel, fashion, and
            more.
          </p>
        </div>
      </section>

      <main className="cat-main">
        {/* Category cards */}
        <div className="cat-grid-wrapper">
          <div className="cat-grid" role="list" aria-label="Voucher categories">
            {categories.map(({ key, icon: Icon, label, color }) => {
              const isActive = activeCategory === key;
              const count = categoryCounts[key];
              return (
                <button
                  key={key}
                  type="button"
                  role="listitem"
                  aria-pressed={isActive}
                  onClick={() => handleCategoryChange(key)}
                  className={`cat-card ${isActive ? "cat-card-active" : ""}`}
                  style={{
                    '--category-color': color,
                    '--category-color-light': `${color}15`,
                    '--category-color-border': `${color}40`,
                  }}
                >
                  <div
                    className={`cat-card-icon ${isActive ? "cat-card-icon-active" : ""}`}
                    style={{
                      backgroundColor: isActive ? `${color}20` : `${color}10`,
                      color: color,
                    }}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="cat-card-name">{label}</p>
                  <p className="cat-card-count">
                    {typeof count === "number" ? `${count} vouchers` : "0 voucher"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vouchers section */}
        <div className="cat-vouchers-section">
          <div className="cat-vouchers-header">
            <div>
              <h2 className="cat-vouchers-title">{activeMeta.label}</h2>
              <p className="cat-vouchers-subtitle">
                {loading
                  ? "Loading…"
                  : `${pagination.total} voucher${pagination.total !== 1 ? "s" : ""} available`}
              </p>
            </div>
            <div className="cat-sort-controls">
              <label htmlFor="sort-select" className="cat-sort-label">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="cat-sort-select"
              >
                <option value="newest">Newest</option>
                <option value="points-asc">Points: Low to High</option>
                <option value="points-desc">Points: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
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
                  image={voucher.image}
                  brand={voucher.brand}
                  category={voucher.category_id?.name}
                  categoryIcon={voucher.category_id?.icon}
                  categoryColor={voucher.category_id?.color}
                  title={voucher.title}
                  description={voucher.description}
                  cost={voucher.points}
                  badge={voucher.badge}
                  onGetCode={() =>
                    navigate(`/vouchers/${voucher._id ?? voucher.id}`)
                  }
                />
              ))}
          </div>

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="cat-pagination">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="cat-pagination-button"
              >
                Previous
              </button>
              <div className="cat-pagination-pages">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`cat-pagination-page ${pageNum === page ? "cat-pagination-active" : "cat-pagination-inactive"}`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="cat-pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
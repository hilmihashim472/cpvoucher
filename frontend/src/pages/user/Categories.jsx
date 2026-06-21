import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All Deals");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVouchers = useCallback((category, sortVal, pageNum) => {
    setLoading(true);
    const params = {};
    if (category && category !== "All Deals") params.category = category;
    if (sortVal) params.sort = sortVal;
    if (pageNum > 1) params.page = pageNum;
    params.limit = 9;
    
    axios
      .get(`${API_BASE_URL}/vouchers`, { params })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.vouchers ?? [];
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
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || "All Deals";
    const sortFromUrl = searchParams.get("sort") || "newest";
    const pageFromUrl = parseInt(searchParams.get("page")) || 1;
    
    setActiveCategory(categoryFromUrl);
    setSort(sortFromUrl);
    setPage(pageFromUrl);
    fetchVouchers(categoryFromUrl, sortFromUrl, pageFromUrl);
  }, [searchParams, fetchVouchers]);

  const handleCategoryChange = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === "All Deals") {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }
    newParams.delete("page");
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
                onClick={() => handleCategoryChange(key)}
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
              {loading ? "Loading…" : `${pagination.total} voucher${pagination.total !== 1 ? "s" : ""} available`}
            </p>
          </div>
          <div className="cat-sort-controls">
            <label htmlFor="sort-select" className="cat-sort-label">Sort by:</label>
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
                brand={voucher.brand}
                category={voucher.category?.name ?? voucher.category_id?.name}
                title={voucher.title}
                description={voucher.description}
                cost={voucher.points}
                // pointsLabel={`${voucher.points} pts`}
                badge={voucher.badge}
                onGetCode={() => navigate(`/vouchers/${voucher._id ?? voucher.id}`)}
              />
            ))}
          
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
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

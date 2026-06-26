import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import VoucherCard from "../../components/VoucherCard";
import SkeletonCard from "../../components/SkeletonCard";
import InlineError from "../../components/InlineError";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../hooks/useAuth.jsx";

const FEATURED_PARTNERS = [
  { name: "Starbucks", code: "SBUX-FREE-50", remaining: 120, total: 500 },
  { name: "Adidas", code: "ADIDAS-30OFF", remaining: 64, total: 200 },
];

export default function Home() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchVouchers = useCallback(() => {
    setLoading(true);
    api
      .get("/vouchers", {
        params: {
          sort: "popular",
          limit: 6,
        },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.vouchers ?? [];
        setVouchers(data);
        setError(null);
      })
      .catch(() => {
        setError("Unable to load vouchers right now. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="page-shell">
      <Navbar />

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-content">
            <h1 className="home-hero-title">Unlock Premium Savings Everywhere.</h1>
            <p className="home-hero-subtitle">
              Redeem your reward points for exclusive vouchers from hundreds of
              top brands across food, tech, travel, fashion, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Trending vouchers */}
      <section id="trending-vouchers" className="home-trending">
        <div className="home-trending-header">
          <div>
            <h2 className="home-trending-title">Trending Vouchers</h2>
            <p className="home-trending-subtitle">
              Curated deals based on your recent activity.
            </p>
          </div>
          <button type="button" onClick={() => navigate("/categories")} className="home-view-all">
            View all →
          </button>
        </div>

        <div className="home-trending-grid">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && error && (
            <div className="home-trending-full-width">
              <InlineError message={error} />
            </div>
          )}

          {!loading && !error && vouchers.length === 0 && (
            <div className="home-trending-full-width">
              <EmptyState
                title="No vouchers found"
                description="Try a different category or check back soon for new deals."
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
      </section>

      <Footer />
    </div>
  );
}

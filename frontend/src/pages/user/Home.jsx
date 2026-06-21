import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Copy, Check } from "lucide-react";
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
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchVouchers = useCallback((search = "") => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;

    api
      .get("/vouchers", { params })
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
    const searchFromUrl = searchParams.get("search") || "";
    setSearchQuery(searchFromUrl);
    fetchVouchers(searchFromUrl);
  }, [searchParams, fetchVouchers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/home");
    }
  };

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
            <form onSubmit={handleSearchSubmit} className="home-hero-form">
              <label className="home-hero-search-label">
                <span className="sr-only">Search vouchers</span>
                <Search className="home-hero-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brands, categories, deals..."
                  className="home-hero-search-input"
                />
              </label>
              <button type="submit" className="home-hero-submit">
                Find Deals
              </button>
            </form>
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
        </div>
      </section>

      {/* Expiring soon banner */}
      <section className="home-expiring">
        <div className="home-expiring-grid">
          <div className="home-expiring-content">
            <span className="home-expiring-tag">Limited time</span>
            <h2 className="home-expiring-title">Final Hours to Redeem.</h2>
            <p className="home-expiring-description">
              These featured offers are about to run out. Grab your voucher
              code now before stock runs dry and points reset.
            </p>
            <a href="#trending-vouchers" className="home-expiring-cta">
              Show Countdown Deals
            </a>
          </div>

          <div className="home-partners-grid">
            {FEATURED_PARTNERS.map((partner) => {
              const percentLeft = Math.round((partner.remaining / partner.total) * 100);
              return (
                <div key={partner.name} className="home-partner-card">
                  <p className="home-partner-name">{partner.name}</p>
                  <div className="home-partner-code-row">
                    <code className="home-partner-code">{partner.code}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(partner.code)}
                      aria-label={`Copy voucher code for ${partner.name}`}
                      className="home-partner-copy-button"
                    >
                      {copiedCode === partner.code ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="home-partner-progress">
                    <div className="home-progress-track">
                      <div className="home-progress-fill" style={{ width: `${percentLeft}%` }} />
                    </div>
                    <p className="home-partner-remaining">{partner.remaining} vouchers remaining</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

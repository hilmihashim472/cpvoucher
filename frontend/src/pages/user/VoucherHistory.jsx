import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Search, TrendingUp, Ticket, Wallet, ChevronRight } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import InlineError from "../../components/InlineError";
import EmptyState from "../../components/EmptyState";
import useAuth from "../../hooks/useAuth";
import API_BASE_URL from "../../config/api";

const FILTER_TABS = ["All Orders", "Active", "Used", "Expired"];
const PAGE_SIZE = 5;

// TODO: replace with GET /api/users/me/stats once available
const LIFETIME_STATS = {
  lifetimeSavings: 1248.5,
  vouchersRedeemed: 42,
  brandsCount: 18,
};

const STATUS_STYLES = {
  Active: "history-status-active",
  Used: "history-status-used",
  Expired: "history-status-expired",
};

export default function VoucherHistory() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All Orders");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      axios
        .get(`${API_BASE_URL}/orders`, {
          params: { status: filter, q: search },
        })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : res.data?.orders ?? [];
          setOrders(data);
          setError(null);
          setPage(1);
        })
        .catch(() => {
          setError("Unable to load your order history right now. Please try again later.");
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handler);
  }, [filter, search]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const paginatedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (tab) => {
    setLoading(true);
    setFilter(tab);
  };

  const handleSearchChange = (value) => {
    setLoading(true);
    setSearch(value);
  };

  const handleReportIssue = (order) => {
    toast.success(`Issue reported for "${order.voucherName}". Our team will follow up shortly.`);
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="history-main">
        <h1 className="history-title">Order History</h1>
        <p className="history-subtitle">
          Track every voucher you&apos;ve redeemed and follow up on active or expired codes.
        </p>

        {/* Stats row */}
        <div className="history-stats-grid">
          <div className="history-stat-card">
            <div className="history-stat-header">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span className="history-stat-label">Lifetime Savings</span>
            </div>
            <p className="history-stat-value">${LIFETIME_STATS.lifetimeSavings.toFixed(2)}</p>
            <p className="history-stat-change">12% increase this month</p>
          </div>

          <div className="history-stat-card">
            <div className="history-stat-header">
              <Ticket className="h-4 w-4" aria-hidden="true" />
              <span className="history-stat-label">Total Vouchers Redeemed</span>
            </div>
            <p className="history-stat-value">{LIFETIME_STATS.vouchersRedeemed}</p>
            <p className="history-stat-note">
              Across {LIFETIME_STATS.brandsCount} different brands
            </p>
          </div>

          <div className="history-stat-card-primary">
            <div className="history-stat-header-light">
              <Wallet className="h-4 w-4" aria-hidden="true" />
              <span className="history-stat-label">Available Points</span>
            </div>
            <p className="history-stat-value-light">
              {Number(user.points ?? 0).toLocaleString()}
            </p>
            <Link to="/" className="history-redeem-link">
              Redeem Now
            </Link>
          </div>
        </div>

        {/* Search + filter tabs */}
        <div className="history-toolbar">
          <label className="history-search-label">
            <span className="sr-only">Search orders</span>
            <Search className="history-search-icon" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by voucher name..."
              className="history-search-input"
            />
          </label>

          <div className="history-filter-tabs scrollbar-hide">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleFilterChange(tab)}
                aria-pressed={filter === tab}
                className={`history-filter-tab ${
                  filter === tab ? "history-filter-tab-active" : "history-filter-tab-inactive"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders table */}
        <div className="history-table-card">
          {loading ? (
            <div className="history-table-loading">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="history-table-skeleton-row" />
              ))}
            </div>
          ) : error ? (
            <div className="history-table-padding">
              <InlineError message={error} />
            </div>
          ) : orders.length === 0 ? (
            <div className="history-table-padding">
              <EmptyState title="No orders found" description="Try a different filter or search term." />
            </div>
          ) : (
            <>
              <div className="history-table-scroll">
                <table className="history-table">
                  <thead className="history-table-head">
                    <tr>
                      <th scope="col" className="history-table-head-cell">
                        Voucher Name
                      </th>
                      <th scope="col" className="history-table-head-cell">
                        Redemption Date
                      </th>
                      <th scope="col" className="history-table-head-cell">
                        Points Used
                      </th>
                      <th scope="col" className="history-table-head-cell">
                        Status
                      </th>
                      <th scope="col" className="history-table-head-cell">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="history-table-body">
                    {paginatedOrders.map((order) => {
                      const id = order._id ?? order.id;
                      return (
                        <tr key={id}>
                          <td className="history-table-cell-strong">{order.voucherName}</td>
                          <td className="history-table-cell">{order.redemptionDate}</td>
                          <td className="history-table-cell">
                            {Number(order.pointsUsed ?? 0).toLocaleString()}
                          </td>
                          <td className="history-table-cell-status">
                            <span
                              className={`history-status-badge ${
                                STATUS_STYLES[order.status] ?? "history-status-default"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="history-table-cell-status">
                            {order.status === "Used" && (
                              <Link to={`/vouchers/${order.voucherId ?? id}`} className="history-view-link">
                                View Details
                              </Link>
                            )}
                            {order.status === "Expired" && (
                              <button
                                type="button"
                                onClick={() => handleReportIssue(order)}
                                className="history-report-button"
                              >
                                Report Issue
                              </button>
                            )}
                            {order.status === "Active" && <span className="history-table-dash">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="history-pagination">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      aria-current={page === pageNum ? "page" : undefined}
                      className={`history-page-button ${
                        page === pageNum ? "history-page-button-active" : "history-page-button-inactive"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="history-next-button"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Upgrade banner */}
        <div className="history-upgrade-banner">
          <span className="history-upgrade-tag">Premium Offer</span>
          <h2 className="history-upgrade-title">Upgrade to Gold and Earn 2x Points</h2>
          <p className="history-upgrade-description">
            Gold members earn double points on every voucher redemption, get
            early access to limited drops, and unlock exclusive partner
            discounts.
          </p>
          <button
            type="button"
            onClick={() => toast("Gold membership is coming soon!")}
            className="history-upgrade-button"
          >
            Learn More
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

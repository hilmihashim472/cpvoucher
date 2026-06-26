import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  TrendingUp, 
  Ticket, 
  Wallet, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  Download, 
  AlertCircle,
  X,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";

const PAGE_SIZE = 5;

/* ──────────────────────────────────────────────
   SKELETON LOADER (Matches VoucherList)
   ────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded font-mono" /></td>
      <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-200 rounded-lg ml-auto" /></td>
    </tr>
  );
}

/* ──────────────────────────────────────────────
   MODAL WRAPPER (Matches VoucherList)
   ────────────────────────────────────────────── */
function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]" />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} animate-[slideUp_300ms_ease-out] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export default function OrderHistory() {
  const { user, api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  
  // Search & Sort states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    api
      .get("orders/history")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.orders || []);
        setOrders(data);
        setError(null);
      })
      .catch(() => {
        setError("Unable to load your order history right now. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [api]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortField, sortOrder]);

  // Scroll to top whenever page changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Handle sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to descending for dates/numbers
    }
  };

  const SortIcon = ({ field }) =>
    sortField === field ? (
      sortOrder === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
      )
    ) : (
      <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
    );

  // Filter orders based on search
  const filteredOrders = orders.filter((order) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    const voucher = order.voucher || {};
    return (
      voucher.title?.toLowerCase().includes(q) ||
      voucher.brand?.toLowerCase().includes(q) ||
      voucher.code?.toLowerCase().includes(q) ||
      order.orderNumber?.toLowerCase().includes(q)
    );
  });

  // Sort filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valA, valB;
    if (sortField === "title") {
      valA = (a.voucher?.title || "").toLowerCase();
      valB = (b.voucher?.title || "").toLowerCase();
    } else if (sortField === "timestamp") {
      valA = new Date(a.timestamp).getTime() || 0;
      valB = new Date(b.timestamp).getTime() || 0;
    } else if (sortField === "pointsUsed") {
      valA = a.pointsUsed || 0;
      valB = b.pointsUsed || 0;
    } else if (sortField === "expiresAt") {
      valA = new Date(a.voucher?.expiresAt).getTime() || 0;
      valB = new Date(b.voucher?.expiresAt).getTime() || 0;
    } else {
      return 0;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const paginatedOrders = sortedOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats calculated from ALL orders (ignoring search/sort), just like VoucherList
  const lifetimeSavings = orders.reduce((acc, order) => acc + (order.discountAmount || 0), 0);
  const brandsCount = new Set(orders.map(o => o.voucher?.brand).filter(Boolean)).size;

  const handlePageChange = (newPage) => setPage(newPage);

  const handleViewReceipt = (order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section style={{ background: "linear-gradient(150deg, #020408 0%, #0c1a3a 50%, #1a3570 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
          <h1 className="text-2xl font-extrabold text-white sm:text-4xl">Order History</h1>
          <p className="mt-1 text-sm text-slate-300 sm:mt-2 sm:text-base">Track every voucher you&apos;ve redeemed and view your receipts.</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 rounded-xl text-emerald-600 bg-emerald-50"><TrendingUp className="h-5 w-5" /></div>
            <div>
              <p className="text-xl font-bold text-gray-900">RM {loading ? "..." : lifetimeSavings.toFixed(2)}</p>
              <p className="text-xs text-gray-500 font-medium">Lifetime Savings</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 rounded-xl text-blue-600 bg-blue-50"><Ticket className="h-5 w-5" /></div>
            <div>
              <p className="text-xl font-bold text-gray-900">{loading ? "..." : orders.length}</p>
              <p className="text-xs text-gray-500 font-medium">Vouchers Redeemed ({brandsCount} brands)</p>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 rounded-xl text-amber-600 bg-amber-50"><Wallet className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="text-xl font-bold text-gray-900">{Number(user?.points ?? 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-medium">Available Points</p>
            </div>
            <Link to="/categories" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Redeem &rarr;</Link>
          </div>
        </div>

        {/* ── TOOLBAR (Search Bar) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search by voucher name, brand, code, or order number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* ── MOBILE CARDS (< sm) ── */}
        <div className="sm:hidden space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
              </div>
            ))
          ) : error ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-red-50 rounded-2xl"><AlertCircle className="h-8 w-8 text-red-400" /></div>
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-gray-100 rounded-2xl"><Ticket className="h-8 w-8 text-gray-400" /></div>
                <p className="text-sm font-medium text-gray-500">
                  {debouncedSearch ? "No matching orders found" : "No orders found"}
                </p>
                <p className="text-xs text-gray-400">
                  {debouncedSearch ? "Try adjusting your search terms" : "You haven't redeemed any vouchers yet."}
                </p>
              </div>
            </div>
          ) : (
            paginatedOrders.map((order) => {
              const id = order._id ?? order.id;
              const voucher = order.voucher || {};
              return (
                <div key={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{voucher.title || "Unknown Voucher"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{voucher.brand || "Unknown Brand"}</p>
                    </div>
                    <button
                      onClick={() => handleViewReceipt(order)}
                      className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View Receipt"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Redeemed</span>
                      <span className="text-gray-700 font-medium">
                        {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Expires</span>
                      <span className="text-gray-700 font-medium">
                        {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Points Used</span>
                      <span className="text-gray-700 font-medium">{Number(order.pointsUsed ?? 0).toLocaleString()} pts</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 font-mono">
                      {voucher.code || "—"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── MOBILE PAGINATION ── */}
        {!loading && sortedOrders.length > PAGE_SIZE && (
          <div className="sm:hidden mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="cat-pagination-button"
            >
              Previous
            </button>
            <div className="cat-pagination-pages">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`cat-pagination-page ${pageNum === page ? "cat-pagination-active" : "cat-pagination-inactive"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="cat-pagination-button"
            >
              Next
            </button>
          </div>
        )}

        {/* ── DESKTOP TABLE (≥ sm) ── */}
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {[
                    { label: "Voucher Name", field: "title" },
                    { label: "Redemption Date", field: "timestamp" },
                    { label: "Expiry Date", field: "expiresAt" },
                    { label: "Points Used", field: "pointsUsed" },
                    { label: "Voucher Code", field: null },
                  ].map((col) => (
                    <th
                      key={col.label}
                      onClick={col.field ? () => handleSort(col.field) : undefined}
                      className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                        col.field ? "cursor-pointer hover:text-gray-700 select-none" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {col.label}
                        {col.field && <SortIcon field={col.field} />}
                      </span>
                    </th>
                  ))}
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-red-50 rounded-2xl"><AlertCircle className="h-8 w-8 text-red-400" /></div>
                        <p className="text-sm font-medium text-red-600">{error}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 rounded-2xl"><Ticket className="h-8 w-8 text-gray-400" /></div>
                        <p className="text-sm font-medium text-gray-500">
                          {debouncedSearch ? "No matching orders found" : "No orders found"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {debouncedSearch ? "Try adjusting your search terms" : "You haven't redeemed any vouchers yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const id = order._id ?? order.id;
                    const voucher = order.voucher || {};
                    return (
                      <tr key={id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">{voucher.title || "Unknown Voucher"}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{voucher.brand || "Unknown Brand"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700">
                            {Number(order.pointsUsed ?? 0).toLocaleString()} pts
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 font-mono">
                            {voucher.code || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-70 hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewReceipt(order)}
                              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View Receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION ── */}
          {!loading && sortedOrders.length > PAGE_SIZE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/40">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-700">{(page - 1) * PAGE_SIZE + 1}</span>
                {" – "}
                <span className="font-semibold text-gray-700">{Math.min(page * PAGE_SIZE, sortedOrders.length)}</span>
                {" of "}
                <span className="font-semibold text-gray-700">{sortedOrders.length}</span> orders
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── UPGRADE BANNER ── */}
        <div className="history-upgrade-banner">
          <span className="history-upgrade-tag">Premium Offer</span>
          <h2 className="history-upgrade-title">Upgrade to Gold and Earn 2x Points</h2>
          <p className="history-upgrade-description">
            Gold members earn double points on every voucher redemption, get early access
            to limited drops, and unlock exclusive partner discounts.
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

      {/* ── RECEIPT MODAL ── */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Order Receipt"
        maxWidth="max-w-3xl"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {selectedOrder.receiptUrl ? (
              <>
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <iframe 
                    src={selectedOrder.receiptUrl} 
                    className="w-full h-[60vh]" 
                    title="Receipt PDF"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <a 
                    href={selectedOrder.receiptUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 inline-flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Open in New Tab
                  </a>
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <AlertCircle className="h-7 w-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Receipt Available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The receipt for this order might still be generating or is unavailable.
                </p>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="mt-6 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
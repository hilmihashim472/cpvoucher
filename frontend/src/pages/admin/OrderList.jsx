import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

/* ──────────────────────────────────────────────
   SKELETON LOADER
   ────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      </td>
    </tr>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export default function OrderList() {
  const { api } = useAuth();

  // Data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  /* ── Debounce ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Fetch ── */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort: sortField,
        order: sortOrder,
        search: debouncedSearch,
      });
      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || pagination);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [api, pagination.page, pagination.limit, sortField, sortOrder, debouncedSearch]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPagination((p) => ({ ...p, page: 1 })); }, [debouncedSearch, sortField, sortOrder]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pagination.page]);

  /* ── Sort ── */
  const handleSort = (field) => {
    if (sortField === field) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortOrder("asc"); }
  };
  const SortIcon = ({ field }) =>
    sortField === field
      ? sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-blue-600" /> : <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
      : <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />;

  /* ── Computed stats ── */
  const totalCompleted = orders.filter((o) => o.status === "completed").length;
  const totalPending = orders.filter((o) => o.status === "pending").length;

  /* ── Export to CSV ── */
  const exportCSV = () => {
    const headers = ["Order ID", "User", "Voucher", "Points", "Date"];
    
    const rows = orders.map((o) => [
      o.orderNumber || o.id || "",
      o.user?.fullName || o.user?.username || o.user || "Unknown",
      o.voucher?.title || o.voucher || "Unknown",
      o.pointsUsed || o.points || 0,
      o.timestamp ? new Date(o.timestamp).toLocaleDateString() : o.date || "",
    ]);
  
    // BOM for Excel UTF-8 support
    const bom = "\uFEFF";
    const csv = bom + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Orders exported successfully!");
};


  /* ────────────────────────────────────────────
      RENDER
      ──────────────────────────────────────────── */
  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-content">
        <main className="admin-main">

          {/* ── HEADER ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order History</h1>
              <p className="mt-1 text-sm text-gray-500">Track and manage all voucher redemption orders.</p>
            </div>
            <button onClick={exportCSV}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 active:scale-[0.97] transition-all shadow-lg shadow-blue-600/25"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Total Orders", value: pagination.total, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-3 lg:p-4 flex items-center gap-3 shadow-sm">
                <div className={`p-2.5 rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── TOOLBAR ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 lg:p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search by order ID, user, or voucher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="sm:hidden space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-28 bg-gray-100 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                </div>
              ))
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-100 rounded-2xl"><ShoppingBag className="h-8 w-8 text-gray-400" /></div>
                  <p className="text-sm font-medium text-gray-500">No orders found</p>
                  <p className="text-xs text-gray-400">Try adjusting your search term</p>
                </div>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o._id || o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{o.orderNumber || o.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{o.voucher?.title || o.voucher || "Unknown"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (o.receiptUrl) window.open(`http://localhost:5000${o.receiptUrl}`, "_blank");
                        else toast.error("Receipt not available for this order.");
                      }}
                      className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">User</span>
                      <span className="text-gray-700 font-medium">{o.user?.fullName || o.user?.username || o.user || "Unknown"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Points</span>
                      <span className="text-gray-700 font-medium">{(o.pointsUsed || o.points || 0).toLocaleString()} pts</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Date</span>
                      <span className="text-gray-700 font-medium">{o.timestamp ? new Date(o.timestamp).toLocaleDateString() : o.date || "—"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {!loading && pagination.totalPages > 0 && (
              <div className="cat-pagination">
                <button onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="cat-pagination-button">Previous</button>
                <div className="cat-pagination-pages">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let pg;
                    if (pagination.totalPages <= 5) pg = i + 1;
                    else if (pagination.page <= 3) pg = i + 1;
                    else if (pagination.page >= pagination.totalPages - 2) pg = pagination.totalPages - 4 + i;
                    else pg = pagination.page - 2 + i;
                    return (
                      <button key={pg} onClick={() => setPagination((p) => ({ ...p, page: pg }))}
                        className={`cat-pagination-page ${pg === pagination.page ? "cat-pagination-active" : "cat-pagination-inactive"}`}>{pg}</button>
                    );
                  })}
                </div>
                <button onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages} className="cat-pagination-button">Next</button>
              </div>
            )}
          </div>

          {/* ── TABLE ── */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {[
                      { label: "Order ID", field: "id" },
                      { label: "User", field: null },
                      { label: "Voucher", field: null },
                      { label: "Points", field: "points" },
                      { label: "Date", field: "date" },
                    ].map((col) => (
                      <th
                        key={col.label}
                        onClick={col.field ? () => handleSort(col.field) : undefined}
                        className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.field ? "cursor-pointer hover:text-gray-700 select-none" : ""}`}
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
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    : orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-100 rounded-2xl">
                              <ShoppingBag className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No orders found</p>
                            <p className="text-xs text-gray-400">Try adjusting your search term</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o._id || o.id} className="group hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-900">{o.orderNumber || o.id}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {o.user?.fullName || o.user?.username || o.user || "Unknown"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {o.voucher?.title || o.voucher || "Unknown"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">
                            {(o.pointsUsed || o.points || 0).toLocaleString()} pts
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {o.timestamp ? new Date(o.timestamp).toLocaleDateString() : o.date || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                aria-label={`View receipt for order ${o.orderNumber || o.id}`}
                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="View Receipt"
                                onClick={() => {
                                  if (o.receiptUrl) {
                                    window.open(`http://localhost:5000${o.receiptUrl}`, "_blank");
                                  } else {
                                    toast.error("Receipt not available for this order.");
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                </tbody>
              </table>
            </div>

            {/* ── PAGINATION ── */}
            {!loading && pagination.totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/40">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{(pagination.page - 1) * pagination.limit + 1}</span>
                  {" – "}
                  <span className="font-semibold text-gray-700">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                  {" of "}
                  <span className="font-semibold text-gray-700">{pagination.total}</span> orders
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let page;
                    if (pagination.totalPages <= 5) page = i + 1;
                    else if (pagination.page <= 3) page = i + 1;
                    else if (pagination.page >= pagination.totalPages - 2) page = pagination.totalPages - 4 + i;
                    else page = pagination.page - 2 + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination((p) => ({ ...p, page }))}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === pagination.page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="admin-footer">
          <div className="admin-footer-inner">
            <span>Carter Bank Voucher Capstone Project 2026</span>
            <nav aria-label="Admin footer links" className="admin-footer-nav">
              <a href="#" className="admin-footer-link">Documentation</a>
              <a href="#" className="admin-footer-link">Support Ticket</a>
              <button type="button" className="admin-footer-logout">Logout</button>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
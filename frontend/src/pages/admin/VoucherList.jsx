import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth.jsx";
import toast from "react-hot-toast";
import API_BASE_URL from "../../config/api";

const STATUS_FILTERS = ["All", "active", "draft", "expired", "fully-claimed"];

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700",
  expired: "bg-red-100 text-red-700",
  draft: "bg-amber-100 text-amber-700",
  "fully-claimed": "bg-gray-100 text-gray-700",
};

const STATUS_DOT_COLORS = {
  active: "bg-emerald-500",
  expired: "bg-red-500",
  draft: "bg-amber-500",
  "fully-claimed": "bg-gray-500",
};

// Helper to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL.replace("/api", "")}${imagePath}`;
};

/* ──────────────────────────────────────────────
   SKELETON LOADER
   ────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-100 rounded font-mono" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-24 bg-gray-200 rounded" />
      </td>
    </tr>
  );
}

/* ──────────────────────────────────────────────
   MODAL WRAPPER
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
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
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
export default function VoucherList() {
  const { api } = useAuth();

  // Data
  const [vouchers, setVouchers] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* ── Debounce ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Fetch all vouchers for accurate stats (ignores search & status filters) ── */
  const fetchAllVouchers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: 1,
        limit: 1000,
        sort: "createdAt",
        order: "desc",
      });

      const { data } = await api.get(`/admin/vouchers?${params}`);
      setAllVouchers(data.vouchers || []);
    } catch (error) {
      console.error("Failed to load all vouchers for stats");
    }
  }, [api]);

  /* ── Fetch paginated vouchers for table ── */
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      // Map frontend sort state to backend sort parameter format
      let sortParam = "newest";
      if (sortField === "title") {
        sortParam = sortOrder === "asc" ? "title-asc" : "title-desc";
      } else if (sortField === "points") {
        sortParam = sortOrder === "asc" ? "points-asc" : "points-desc";
      } else if (sortField === "expiresAt") {
        sortParam = sortOrder === "asc" ? "expiresAt-asc" : "expiresAt-desc";
      } else if (sortField === "newest") {
        sortParam = "newest";
      }

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort: sortParam,
        search: debouncedSearch,
        status: statusFilter,
      });

      const { data } = await api.get(`/admin/vouchers?${params}`);
      setVouchers(data.vouchers);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  }, [
    api,
    pagination.page,
    pagination.limit,
    sortField,
    sortOrder,
    debouncedSearch,
    statusFilter,
  ]);

  /* ── Fetch all on mount and when search changes ── */
  useEffect(() => {
    fetchAllVouchers();
  }, [fetchAllVouchers]);

  /* ── Fetch paginated when filters change ── */
  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter, sortField, sortOrder]);

  /* ── Sort ── */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
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

  /* ── Status Detection ── */
  const getVoucherStatus = (voucher) => {
    if (voucher.status === "draft") return "draft";
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date())
      return "expired";
    if (voucher.usageCount >= voucher.quantity) return "fully-claimed";
    return "active";
  };

  /* ── View ── */
  const handleView = (voucher) => {
    setSelectedVoucher(voucher);
    setViewModalOpen(true);
  };

  /* ── Delete ── */
  const openDeleteModal = (voucher) => {
    setSelectedVoucher(voucher);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/admin/vouchers/${selectedVoucher._id}`);
      toast.success("Voucher deleted!", { icon: "🗑️" });
      setDeleteModalOpen(false);
      fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete voucher");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Computed Stats (from all vouchers, not just paginated) ── */
  const stats = {
    active: allVouchers.filter((v) => getVoucherStatus(v) === "active").length,
    draft: allVouchers.filter((v) => getVoucherStatus(v) === "draft").length,
    expired: allVouchers.filter((v) => getVoucherStatus(v) === "expired").length,
    fullyClaimed: allVouchers.filter((v) => getVoucherStatus(v) === "fully-claimed").length,
  };

  /* ────────────────────────────────────────────
     RENDER
     ──────────────────────────────────────────── */
  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-content">
        <main className="admin-main p-6 lg:p-8 space-y-6">
          {/* ── HEADER ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Voucher Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Browse, edit, and publish vouchers across all merchants.
              </p>
            </div>
            <Link
              to="/admin/vouchers/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 active:scale-[0.97] transition-all shadow-lg shadow-blue-600/25"
            >
              <Plus className="h-4 w-4" /> Add Voucher
            </Link>
          </div>

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Active",
                value: stats.active,
                icon: CheckCircle2,
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                label: "Drafts",
                value: stats.draft,
                icon: Package,
                color: "text-amber-600 bg-amber-50",
              },
              {
                label: "Expired",
                value: stats.expired,
                icon: AlertCircle,
                color: "text-red-600 bg-red-50",
              },
              {
                label: "Fully Claimed",
                value: stats.fullyClaimed,
                icon: Clock,
                color: "text-gray-600 bg-gray-50",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm"
              >
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search by title, brand, or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5 overflow-x-auto">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    statusFilter === f
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f === "fully-claimed" ? "Fully Claimed" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {[
                      { label: "Voucher", field: "title" },
                      { label: "Category", field: null },
                      { label: "Points", field: "points" },
                      { label: "Brand", field: "brand" },
                      { label: "Status", field: null },
                      { label: "Expires", field: "expiresAt" },
                    ].map((col) => (
                      <th
                        key={col.label}
                        onClick={col.field ? () => handleSort(col.field) : undefined}
                        className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                          col.field
                            ? "cursor-pointer hover:text-gray-700 select-none"
                            : ""
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {col.label}
                          {col.field && <SortIcon field={col.field} />}
                        </span>
                      </th>
                    ))}
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-gray-100 rounded-2xl">
                            <Ticket className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-500">
                            No vouchers found
                          </p>
                          <p className="text-xs text-gray-400">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    vouchers.map((v) => {
                      const status = getVoucherStatus(v);
                      const isUsed = v.usageCount > 0;
                      return (
                        <tr
                          key={v._id}
                          className="group hover:bg-blue-50/30 transition-colors"
                        >
                          {/* Voucher */}
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {v.title}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                              {v.code}
                            </p>
                          </td>
                          {/* Category */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                              {v.category_id?.name || "General"}
                            </span>
                          </td>
                          {/* Points */}
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-700">
                              {v.points.toLocaleString()} pts
                            </span>
                          </td>
                          {/* Brand */}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {v.brand}
                          </td>
                          {/* Status */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit ${STATUS_STYLES[status]}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[status]}`}
                                />
                                {status === "fully-claimed"
                                  ? "Fully Claimed"
                                  : status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {v.usageCount}/{v.quantity} claimed
                              </span>
                            </div>
                          </td>
                          {/* Expires */}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {v.expiresAt
                              ? new Date(v.expiresAt).toLocaleDateString()
                              : "—"}
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleView(v)}
                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <Link
                                to={`/admin/vouchers/add?id=${v._id}`}
                                className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => openDeleteModal(v)}
                                disabled={isUsed}
                                className={`p-2 rounded-lg transition-colors ${
                                  isUsed
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                }`}
                                title={
                                  isUsed
                                    ? `Cannot delete: used ${v.usageCount} time(s)`
                                    : "Delete"
                                }
                              >
                                <Trash2 className="h-4 w-4" />
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
            {!loading && pagination.totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/40">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>
                  {" – "}
                  <span className="font-semibold text-gray-700">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>
                  {" of "}
                  <span className="font-semibold text-gray-700">
                    {pagination.total}
                  </span>{" "}
                  vouchers
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page - 1 }))
                    }
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from(
                    { length: Math.min(pagination.totalPages, 5) },
                    (_, i) => {
                      let page;
                      if (pagination.totalPages <= 5) page = i + 1;
                      else if (pagination.page <= 3) page = i + 1;
                      else if (pagination.page >= pagination.totalPages - 2)
                        page = pagination.totalPages - 4 + i;
                      else page = pagination.page - 2 + i;
                      return (
                        <button
                          key={page}
                          onClick={() =>
                            setPagination((p) => ({ ...p, page }))
                          }
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === pagination.page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page + 1 }))
                    }
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

        {/* ═══════════════════════════════════════
            MODALS
            ═══════════════════════════════════════ */}

        {/* ── VIEW MODAL ── */}
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Voucher Details"
          maxWidth="max-w-2xl"
        >
          {selectedVoucher && (
            <div className="space-y-6">
              {/* Image */}
              {selectedVoucher.image && (
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(selectedVoucher.image)}
                    alt={selectedVoucher.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedVoucher.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedVoucher.brand}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    STATUS_STYLES[getVoucherStatus(selectedVoucher)]
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      STATUS_DOT_COLORS[getVoucherStatus(selectedVoucher)]
                    }`}
                  />
                  {getVoucherStatus(selectedVoucher).charAt(0).toUpperCase() +
                    getVoucherStatus(selectedVoucher).slice(1)}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Category</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedVoucher.category_id?.name || "—"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Points</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedVoucher.points.toLocaleString()} pts
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Code</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 font-mono">
                    {selectedVoucher.code}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">
                    Availability
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedVoucher.usageCount} / {selectedVoucher.quantity}{" "}
                    claimed
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Expires</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedVoucher.expiresAt
                      ? new Date(selectedVoucher.expiresAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Discount</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedVoucher.discountAmount
                      ? `$${selectedVoucher.discountAmount}`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedVoucher.description && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">
                    {selectedVoucher.description}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {(selectedVoucher.storeName ||
                selectedVoucher.tagline ||
                selectedVoucher.brandUrl) && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-2">
                    Additional Info
                  </p>
                  <div className="space-y-2">
                    {selectedVoucher.storeName && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Store:</span>{" "}
                        {selectedVoucher.storeName}
                      </p>
                    )}
                    {selectedVoucher.tagline && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Tagline:</span>{" "}
                        {selectedVoucher.tagline}
                      </p>
                    )}
                    {selectedVoucher.brandUrl && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">URL:</span>{" "}
                        <a
                          href={selectedVoucher.brandUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedVoucher.brandUrl}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Link
                  to={`/admin/vouchers/add?id=${selectedVoucher._id}`}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                >
                  Edit Voucher
                </Link>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── DELETE CONFIRMATION ── */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title=""
          maxWidth="max-w-sm"
        >
          {selectedVoucher && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Voucher?
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-700">
                    {selectedVoucher.title}
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-600/25"
                >
                  {submitting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── FOOTER ── */}
        <footer className="admin-footer">
          <div className="admin-footer-inner">
            <span>Carter Bank Voucher Capstone Project 2026</span>
            <nav
              aria-label="Admin footer links"
              className="admin-footer-nav"
            >
              <a href="#" className="admin-footer-link">
                Documentation
              </a>
              <a href="#" className="admin-footer-link">
                Support Ticket
              </a>
              <button type="button" className="admin-footer-logout">
                Logout
              </button>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
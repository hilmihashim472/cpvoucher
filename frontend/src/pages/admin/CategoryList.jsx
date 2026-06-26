import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search, Plus, Pencil, Trash2, X, Tag, Layers, CheckCircle2,
  FileText, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */
const STATUS_FILTERS = ["All", "Active", "Draft"];

const COLOR_OPTIONS = [
  { name: "Orange", value: "#F97316" },
  { name: "Blue", value: "#1A56DB" },
  { name: "Emerald", value: "#10B981" },
  { name: "Red", value: "#EF4444" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Slate", value: "#64748B" },
  { name: "Navy", value: "#1E293B" },
];

const ICON_OPTIONS = [
  { name: "UtensilsCrossed", emoji: "🍽️" },
  { name: "ShoppingBag", emoji: "🛍️" },
  { name: "Laptop", emoji: "💻" },
  { name: "Plane", emoji: "✈️" },
  { name: "Sparkles", emoji: "✨" },
  { name: "Home", emoji: "🏠" },
  { name: "Dumbbell", emoji: "🏋️" },
  { name: "Car", emoji: "🚗" },
  { name: "BookOpen", emoji: "📖" },
  { name: "Heart", emoji: "❤️" },
  { name: "Music", emoji: "🎵" },
  { name: "Coffee", emoji: "☕" },
  { name: "Gift", emoji: "🎁" },
  { name: "Gamepad2", emoji: "🎮" },
  { name: "Tag", emoji: "🏷️" },
  { name: "Zap", emoji: "⚡" },
  { name: "Star", emoji: "⭐" },
  { name: "Baby", emoji: "👶" },
];

const getEmoji = (iconName) =>
  ICON_OPTIONS.find((i) => i.name === iconName)?.emoji || "🏷️";

/* ──────────────────────────────────────────────
   SKELETON LOADER
   ────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-44 bg-gray-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-200 rounded" /></td>
    </tr>
  );
}

/* ──────────────────────────────────────────────
   MODAL WRAPPER
   ────────────────────────────────────────────── */
function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
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
   FORM HELPERS
   ────────────────────────────────────────────── */
function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 " +
  "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export default function CategoryList() {
  const { api } = useAuth();

  // Data
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "", description: "", icon: "Tag", color: "#F97316", status: "draft",
  });
  const [submitting, setSubmitting] = useState(false);

  /* ── Debounce ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Fetch ── */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort: sortField,
        order: sortOrder,
        search: debouncedSearch,
        status: activeFilter,
      });
      const { data } = await api.get(`/admin/categories?${params}`);
      setCategories(data.categories);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [api, pagination.page, pagination.limit, sortField, sortOrder, debouncedSearch, activeFilter]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { setPagination((p) => ({ ...p, page: 1 })); }, [debouncedSearch, activeFilter, sortField, sortOrder]);

  /* ── Sort ── */
  const handleSort = (field) => {
    if (sortField === field) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortOrder("asc"); }
  };
  const SortIcon = ({ field }) =>
    sortField === field
      ? sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-blue-600" /> : <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
      : <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />;

  /* ── Edit ── */
  const openEdit = (cat) => {
    setSelected(cat);
    setEditForm({
      name: cat.name,
      description: cat.description || "",
      icon: cat.icon || "Tag",
      color: cat.color || "#F97316",
      status: cat.status || "draft",
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/admin/categories/${selected._id}`, editForm);
      toast.success("Category updated!", { icon: "✅" });
      setEditOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const openDelete = (cat) => {
    setSelected(cat);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/admin/categories/${selected._id}`);
      toast.success("Category deleted!", { icon: "🗑️" });
      setDeleteOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Computed stats ── */
  const totalActive = categories.filter((c) => c.status === "active").length;
  const totalDraft = categories.filter((c) => c.status === "draft").length;

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
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Category Management</h1>
              <p className="mt-1 text-sm text-gray-500">Organise vouchers into browsable categories for users.</p>
            </div>
            <Link
              to="/admin/categories/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl
                         hover:bg-blue-700 active:scale-[0.97] transition-all shadow-lg shadow-blue-600/25"
            >
              <Plus className="h-4 w-4" /> Add Category
            </Link>
          </div>

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Categories", value: pagination.total, icon: Layers, color: "text-blue-600 bg-blue-50" },
              { label: "Active", value: totalActive, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
              { label: "Drafts", value: totalDraft, icon: FileText, color: "text-amber-600 bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
                <div className={`p-3 rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
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
                placeholder="Search by name or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeFilter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {f}
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
                      { label: "Category", field: "name" },
                      { label: "Vouchers", field: null },
                      { label: "Status", field: "status" },
                    ].map((col) => (
                      <th
                        key={col.label}
                        onClick={col.field ? () => handleSort(col.field) : undefined}
                        className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
                                    ${col.field ? "cursor-pointer hover:text-gray-700 select-none" : ""}`}
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
                    : categories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-100 rounded-2xl">
                              <Tag className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No categories found</p>
                            <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat._id} className="group hover:bg-blue-50/30 transition-colors">
                          {/* Category */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                                style={{ backgroundColor: `${cat.color || "#F97316"}20` }}
                              >
                                {getEmoji(cat.icon)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">{cat.description || "No description"}</p>
                              </div>
                            </div>
                          </td>
                          {/* Vouchers */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                              <Layers className="h-3.5 w-3.5 text-gray-400" />
                              {cat.voucherCount.toLocaleString()}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cat.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                              {cat.status.charAt(0).toUpperCase() + cat.status.slice(1)}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(cat)}
                                className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              {/* Delete button - disabled if category has vouchers */}
                              <div className="relative group/delete">
                                <button
                                  onClick={() => openDelete(cat)}
                                  disabled={cat.voucherCount > 0}
                                  className={`p-2 rounded-lg transition-colors ${cat.voucherCount > 0
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    }`}
                                  title={cat.voucherCount > 0 ? `Cannot delete: ${cat.voucherCount} voucher(s) using this category` : "Delete"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>

                                {/* Tooltip for disabled button */}
                                {cat.voucherCount > 0 && (
                                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/delete:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    Cannot delete: {cat.voucherCount} voucher(s) using this category
                                    <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900" />
                                  </div>
                                )}
                              </div>
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
                  <span className="font-semibold text-gray-700">{pagination.total}</span> categories
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
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === pagination.page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                          }`}
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

        {/* ═══════════════════════════════════════
            MODALS
            ═══════════════════════════════════════ */}

        {/* ── EDIT MODAL ── */}
        <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Category">
          <form onSubmit={handleUpdate} className="space-y-5">
            <FormField label="Name" required>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className={inputClass}
                placeholder="e.g. Food & Beverage"
              />
            </FormField>

            <FormField label="Description">
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className={`${inputClass} resize-none`}
                placeholder="Brief description of this category"
              />
            </FormField>

            {/* Color Picker */}
            <FormField label="Accent Color">
              <div className="flex flex-wrap gap-2 mt-1">
                {COLOR_OPTIONS.map(({ name, value }) => (
                  <button
                    key={value}
                    type="button"
                    title={name}
                    onClick={() => setEditForm({ ...editForm, color: value })}
                    className={`w-8 h-8 rounded-lg transition-all ${editForm.color === value
                      ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                      : "hover:scale-105"
                      }`}
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>
            </FormField>

            {/* Icon Picker */}
            <FormField label="Icon" required>
              <div className="grid grid-cols-9 gap-1.5 mt-1">
                {ICON_OPTIONS.map(({ name, emoji }) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => setEditForm({ ...editForm, icon: name })}
                    className={`w-9 h-9 rounded-lg text-base flex items-center justify-center transition-all ${editForm.icon === name
                      ? "bg-blue-100 ring-2 ring-blue-500 scale-110"
                      : "bg-gray-50 hover:bg-gray-100"
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </FormField>

            {/* Status */}
            <FormField label="Status">
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className={inputClass}
              >
                <option value="draft">Draft – hidden from users</option>
                <option value="active">Active – visible to users</option>
              </select>
            </FormField>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/25"
              >
                {submitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ── DELETE CONFIRMATION ── */}
        <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="" maxWidth="max-w-sm">
          {selected && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Category?</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete <strong className="text-gray-700">{selected.name}</strong>?
                </p>

                {/* Warning if category has vouchers */}
                {selected.voucherCount > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-700 font-medium">
                      ⚠️ This category has {selected.voucherCount} voucher(s) assigned to it.
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      You must reassign or delete these vouchers first.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteOpen(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting || selected.voucherCount > 0}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-600/25"
                >
                  {submitting ? "Deleting…" : selected.voucherCount > 0 ? "Cannot Delete" : "Delete"}
                </button>
              </div>
            </div>
          )}
        </Modal>

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
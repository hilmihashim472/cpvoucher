import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, UserPlus, Pencil, Ban, Eye, X,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Shield, ShieldAlert, Users, Mail, Star, Calendar, CheckCircle2, AlertTriangle
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */
const ROLE_FILTERS = ["All", "User", "Admin"];

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
];

const getGradient = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

/* ──────────────────────────────────────────────
   SKELETON LOADER
   ────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-44 bg-gray-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-8 w-28 bg-gray-200 rounded" /></td>
    </tr>
  );
}

/* ──────────────────────────────────────────────
   MODAL WRAPPER (backdrop blur + animation)
   ────────────────────────────────────────────── */
function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]" />

      {/* Panel */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} 
                    animate-[slideUp_300ms_ease-out] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────
   FORM INPUT COMPONENT
   ────────────────────────────────────────────── */
function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
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
export default function UserList() {
  const { api, user: currentUser } = useAuth();

  // Data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Forms
  const [submitting, setSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", username: "", email: "", password: "", role: "user", points: 2500 });
  const [editForm, setEditForm] = useState({ fullName: "", username: "", email: "", role: "user", points: 1000 });

  /* ── Debounce ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Fetch ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page, limit: pagination.limit,
        sort: sortField, order: sortOrder,
        search: debouncedSearch, role: activeFilter,
      });
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(
        data.users.map((u) => ({
          id: u._id, 
          // ✅ CHANGED: Prioritize username, fallback to fullName
          name: u.username || u.fullName, 
          email: u.email,
          username: u.username, 
          fullName: u.fullName, 
          points: u.points,
          role: u.role, 
          status: u.is_active ? "active" : "suspended",
          joined: new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          createdAt: u.createdAt,
        }))
      );
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [api, pagination.page, pagination.limit, sortField, sortOrder, debouncedSearch, activeFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPagination((p) => ({ ...p, page: 1 })); }, [debouncedSearch, activeFilter, sortField, sortOrder]);

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

  /* ── Suspend / Unsuspend ── */
  const openConfirm = (u) => {
    setSelectedUser(u);
    setConfirmAction({ type: u.status === "active" ? "suspend" : "unsuspend", userId: u.id, currentStatus: u.status, name: u.name });
    setConfirmOpen(true);
  };
  const executeConfirm = async () => {
    try {
      await api.patch(`/admin/users/${confirmAction.userId}`, { is_active: confirmAction.currentStatus !== "active" });
      setUsers((prev) => prev.map((u) => u.id === confirmAction.userId ? { ...u, status: confirmAction.currentStatus === "active" ? "suspended" : "active" } : u));
      toast.success(`User ${confirmAction.type === "suspend" ? "suspended" : "unsuspended"} successfully`, { icon: "🛡️" });
      setConfirmOpen(false);
    } catch { toast.error("Action failed"); }
  };

  /* ── Create ── */
  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const { data } = await api.post("/admin/users", newUser);
      const mapped = {
        id: data._id, name: data.fullName || data.username, email: data.email,
        username: data.username, fullName: data.fullName, points: data.points,
        role: data.role, status: data.is_active ? "active" : "suspended",
        joined: new Date(data.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      };
      setUsers((prev) => [mapped, ...prev.slice(0, -1)]);
      toast.success("User created!", { icon: "✅" });
      setCreateOpen(false);
      setNewUser({ username: "", email: "", password: "", role: "user", points: 1000 });
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create user"); }
    finally { setSubmitting(false); }
  };

  /* ── Update ── */
  const handleUpdate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.patch(`/admin/users/${selectedUser.id}`, editForm);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, fullName: editForm.fullName, username : editForm.username, email: editForm.email, role: editForm.role, points: editForm.points } : u));
      toast.success("User updated!", { icon: "✅" });
      setEditOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to update user"); }
    finally { setSubmitting(false); }
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
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
              <p className="mt-1 text-sm text-gray-500">View, manage, and moderate all registered users.</p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl
                         hover:bg-blue-700 active:scale-[0.97] transition-all shadow-lg shadow-blue-600/25"
            >
              <UserPlus className="h-4 w-4" /> Invite User
            </button>
          </div>

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Total Users", value: pagination.total, icon: Users, color: "text-blue-600 bg-blue-50" },
              { label: "Active", value: users.filter((u) => u.status === "active").length, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
              { label: "Suspended", value: users.filter((u) => u.status === "suspended").length, icon: ShieldAlert, color: "text-red-600 bg-red-50" },
            ].map((s, i, arr) => (
              <div key={s.label} className={`bg-white rounded-2xl border border-gray-100 p-3 lg:p-4 flex items-center gap-3 shadow-sm${i === arr.length - 1 && arr.length % 2 !== 0 ? " col-span-2 sm:col-span-1" : ""}`}>
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
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
              {ROLE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeFilter === f
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="sm:hidden space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-40 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : users.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-100 rounded-2xl"><Users className="h-8 w-8 text-gray-400" /></div>
                  <p className="text-sm font-medium text-gray-500">No users found</p>
                  <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(u.name)} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setSelectedUser(u); setViewOpen(true); }}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setSelectedUser(u); setEditForm({ fullName: u.fullName, username: u.username, email: u.email, role: u.role, points: u.points }); setEditOpen(true); }}
                        className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => openConfirm(u)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Ban className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${u.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"}`}>
                      {u.role === "admin" ? <Shield className="h-3 w-3" /> : null}
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Points</span>
                      <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        {u.points.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Joined</span>
                      <span className="text-gray-700 font-medium">{u.joined}</span>
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
                      { label: "User", field: "username" },
                      { label: "Points", field: "points" },
                      { label: "Role", field: "role" },
                      { label: "Status", field: null },
                      { label: "Joined", field: "createdAt" },
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
                    : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-100 rounded-2xl">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No users found</p>
                            <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="group hover:bg-blue-50/30 transition-colors">
                          {/* User */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(u.name)} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          {/* Points */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                              {u.points.toLocaleString()}
                            </span>
                          </td>
                          {/* Role */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${u.role === "admin"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-gray-100 text-gray-600"
                              }`}>
                              {u.role === "admin" ? <Shield className="h-3 w-3" /> : null}
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${u.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                              {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                            </span>
                          </td>
                          {/* Joined */}
                          <td className="px-6 py-4 text-sm text-gray-500">{u.joined}</td>
                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setSelectedUser(u); setViewOpen(true); }}
                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button onClick={() => { setSelectedUser(u); setEditForm({ fullName: u.fullName, username: u.username, email: u.email, role: u.role, points: u.points }); setEditOpen(true); }}
                                className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => openConfirm(u)}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title={u.status === "active" ? "Suspend" : "Unsuspend"}>
                                <Ban className="h-4 w-4" />
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
                  <span className="font-semibold text-gray-700">{pagination.total}</span> users
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let page;
                    if (pagination.totalPages <= 5) page = i + 1;
                    else if (pagination.page <= 3) page = i + 1;
                    else if (pagination.page >= pagination.totalPages - 2) page = pagination.totalPages - 4 + i;
                    else page = pagination.page - 2 + i;
                    return (
                      <button key={page} onClick={() => setPagination((p) => ({ ...p, page }))}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === pagination.page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                          }`}>
                        {page}
                      </button>
                    );
                  })}
                  <button onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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

        {/* ── CREATE ── */}
        <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Invite New User">
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label="Full Name">
              <input
                type="text"
                required
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                className={inputClass}
                placeholder="John Doe"
              />
            </FormField>
            <FormField label="Username">
              <input type="text" required value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className={inputClass} placeholder="johndoe" />
            </FormField>
            <FormField label="Email">
              <input type="email" required value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className={inputClass} placeholder="john@example.com" />
            </FormField>
            <FormField label="Temporary Password">
              <input type="password" required minLength={8} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className={inputClass} placeholder="Min 8 characters" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Role">
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className={inputClass}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
              <FormField label="Points">
                <input type="number" value={newUser.points} onChange={(e) => setNewUser({ ...newUser, points: parseInt(e.target.value) || 0 })} className={inputClass} />
              </FormField>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/25">
                {submitting ? "Creating…" : "Create User"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ── VIEW ── */}
        <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="User Details" maxWidth="max-w-md">
          {selectedUser && (
            <div className="space-y-5">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(selectedUser.name)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedUser.fullName || "N/A"}</h3>
                  <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                </div>
              </div>
              {/* Details Grid */}
              <div className="space-y-3">
                {[
                  { icon: Mail, label: "Email", value: selectedUser.email },
                  { icon: Shield, label: "Role", value: selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) },
                  { icon: CheckCircle2, label: "Status", value: selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1) },
                  { icon: Star, label: "Points", value: `${selectedUser.points.toLocaleString()} pts` },
                  { icon: Calendar, label: "Joined", value: selectedUser.joined },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                      <item.icon className="h-4 w-4" /> {item.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setViewOpen(false)} className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          )}
        </Modal>

        {/* ── EDIT ── */}
        <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit User">
          <form onSubmit={handleUpdate} className="space-y-4">
            <FormField label="Full Name">
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className={inputClass}
              />
            </FormField>
             <FormField label="Username">
              <input type="text" required value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className={inputClass}/>
            </FormField>
            <FormField label="Email">
              <input type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputClass} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Role">
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className={inputClass}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
              <FormField label="Points">
                <input type="number" value={editForm.points} onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })} className={inputClass} />
              </FormField>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">Password cannot be changed by admins. Users must reset their own passwords for security.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/25">
                {submitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ── CONFIRM (Suspend / Unsuspend) ── */}
        <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="" maxWidth="max-w-sm">
          {confirmAction && (
            <div className="text-center space-y-4">
              <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${confirmAction.type === "suspend" ? "bg-red-100" : "bg-emerald-100"
                }`}>
                {confirmAction.type === "suspend"
                  ? <ShieldAlert className="h-7 w-7 text-red-600" />
                  : <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                }
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {confirmAction.type === "suspend" ? "Suspend User?" : "Reactivate User?"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to {confirmAction.type} <strong className="text-gray-700">{confirmAction.name}</strong>?
                  {confirmAction.type === "suspend" && " They will lose access to their account."}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={executeConfirm} className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl transition-colors shadow-lg ${confirmAction.type === "suspend"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-600/25"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                  }`}>
                  {confirmAction.type === "suspend" ? "Suspend" : "Reactivate"}
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
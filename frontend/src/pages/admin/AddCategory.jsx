import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft, Send, FileText, ChevronDown,
  UtensilsCrossed, ShoppingBag, Laptop, Plane, Sparkles,
  Home as HomeIcon, Dumbbell, Car, BookOpen, Heart,
  Music, Coffee, Gift, Gamepad2, Tag, Zap, Star, Baby,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth.jsx";

const ICON_OPTIONS = [
  { name: "UtensilsCrossed", Icon: UtensilsCrossed },
  { name: "ShoppingBag", Icon: ShoppingBag },
  { name: "Laptop", Icon: Laptop },
  { name: "Plane", Icon: Plane },
  { name: "Sparkles", Icon: Sparkles },
  { name: "Home", Icon: HomeIcon },
  { name: "Dumbbell", Icon: Dumbbell },
  { name: "Car", Icon: Car },
  { name: "BookOpen", Icon: BookOpen },
  { name: "Heart", Icon: Heart },
  { name: "Music", Icon: Music },
  { name: "Coffee", Icon: Coffee },
  { name: "Gift", Icon: Gift },
  { name: "Gamepad2", Icon: Gamepad2 },
  { name: "Tag", Icon: Tag },
  { name: "Zap", Icon: Zap },
  { name: "Star", Icon: Star },
  { name: "Baby", Icon: Baby },
];

const ICON_MAP = Object.fromEntries(
  ICON_OPTIONS.map(({ name, Icon }) => [name, Icon])
);

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

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  color: COLOR_OPTIONS[0].value,
  status: "draft",
};

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Category name is required.";
  if (!form.description.trim()) errors.description = "Description is required.";
  if (!form.icon) errors.icon = "Please select an icon.";
  return errors;
}

function LivePreview({ form }) {
  const PreviewIcon = form.icon ? ICON_MAP[form.icon] : null;
  const color = form.color || COLOR_OPTIONS[0].value;

  if (!form.name) {
    return (
      <p className="cadd-preview-empty">
        Enter a category name to preview how it will look.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Category pill
      </p>
      <span
        className="cadd-preview-pill"
        style={{ borderColor: `${color}40`, backgroundColor: `${color}15`, color }}
      >
        {PreviewIcon && <PreviewIcon className="h-4 w-4" aria-hidden="true" />}
        {form.name}
      </span>

      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Category card
      </p>
      <div className="cadd-preview-card-box">
        {PreviewIcon ? (
          <div
            className="cadd-preview-icon-wrap"
            style={{ backgroundColor: `${color}20` }}
          >
            <PreviewIcon
              className="h-6 w-6"
              style={{ color }}
              aria-hidden="true"
            />
          </div>
        ) : (
          <div className="cadd-preview-icon-wrap bg-surface">
            <Tag className="h-6 w-6 text-muted" aria-hidden="true" />
          </div>
        )}
        <p className="cadd-preview-name">{form.name}</p>
        {form.description && (
          <p className="cadd-preview-count">{form.description}</p>
        )}
      </div>
    </div>
  );
}

export default function AddCategory() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, slug: toSlug(prev.name) }));
  }, [form.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const selectIcon = (iconName) => {
    setForm((prev) => ({ ...prev, icon: iconName }));
    if (errors.icon) setErrors((prev) => ({ ...prev, icon: undefined }));
  };

  const selectColor = (colorValue) => {
    setForm((prev) => ({ ...prev, color: colorValue }));
  };

  const handleSave = async (status) => {
    const next = validate(form);
    if (Object.keys(next).length > 0) {
      setErrors(next);
      toast.error("Please fix the highlighted errors before saving.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/admin/categories", { ...form, status });
      toast.success(
        status === "active" ? "Category published!" : "Saved as draft."
      );
      navigate("/admin/categories");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Failed to save category. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className="admin-content">
        <main className="admin-main">
          {/* Header */}
          <div className="cadd-header">
            <div>
              <Link to="/admin/categories" className="cadd-back-link">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Categories
              </Link>
              <h1 className="cadd-title">Add New Category</h1>
              <p className="cadd-subtitle">
                Create a browsable category that groups vouchers for users.
              </p>
            </div>
          </div>

          <div className="cadd-layout">
            {/* ── Left: form ── */}
            <div className="cadd-form-col">

              {/* Basic Information */}
              <div className="cadd-section">
                <p className="cadd-section-title">Basic Information</p>
                <div className="space-y-4">
                  <div className="cadd-field">
                    <label htmlFor="c-name" className="cadd-label">
                      Category Name <span className="cadd-required">*</span>
                    </label>
                    <input
                      id="c-name"
                      name="name"
                      type="text"
                      placeholder="e.g. Food & Beverage"
                      value={form.name}
                      onChange={handleChange}
                      className={`cadd-input ${errors.name ? "cadd-input-error" : ""}`}
                    />
                    {errors.name && <p className="cadd-error-text">{errors.name}</p>}
                  </div>

                  <div className="cadd-field">
                    <label htmlFor="c-slug" className="cadd-label">
                      URL Slug
                    </label>
                    <input
                      id="c-slug"
                      name="slug"
                      type="text"
                      readOnly
                      value={form.slug || "auto-generated-from-name"}
                      className="cadd-input cadd-input-disabled"
                      aria-describedby="c-slug-hint"
                    />
                    <p id="c-slug-hint" className="cadd-hint">
                      Auto-generated from the category name. Used in URLs and filters.
                    </p>
                  </div>

                  <div className="cadd-field">
                    <label htmlFor="c-description" className="cadd-label">
                      Description <span className="cadd-required">*</span>
                    </label>
                    <textarea
                      id="c-description"
                      name="description"
                      rows={3}
                      placeholder="e.g. Restaurants, cafes, and food delivery deals"
                      value={form.description}
                      onChange={handleChange}
                      className={`cadd-textarea ${errors.description ? "cadd-textarea-error" : ""}`}
                    />
                    {errors.description && (
                      <p className="cadd-error-text">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="cadd-section">
                <p className="cadd-section-title">Appearance</p>
                <div className="space-y-6">
                  {/* Color picker */}
                  <div className="cadd-field">
                    <span className="cadd-label">Accent Color</span>
                    <div className="cadd-color-grid mt-2">
                      {COLOR_OPTIONS.map(({ name, value }) => (
                        <button
                          key={value}
                          type="button"
                          title={name}
                          aria-label={`Select ${name} color`}
                          aria-pressed={form.color === value}
                          onClick={() => selectColor(value)}
                          className={`cadd-color-swatch ${
                            form.color === value ? "cadd-color-swatch-active" : ""
                          }`}
                          style={{ backgroundColor: value }}
                        />
                      ))}
                    </div>
                    <p className="cadd-hint mt-2">
                      Applied to the category pill, icon background, and card accent.
                    </p>
                  </div>

                  {/* Icon picker */}
                  <div className="cadd-field">
                    <span className="cadd-label">
                      Icon <span className="cadd-required">*</span>
                    </span>
                    <div className="cadd-icon-grid mt-2">
                      {ICON_OPTIONS.map(({ name, Icon }) => (
                        <button
                          key={name}
                          type="button"
                          title={name}
                          aria-label={`Select ${name} icon`}
                          aria-pressed={form.icon === name}
                          onClick={() => selectIcon(name)}
                          className={`cadd-icon-option ${
                            form.icon === name ? "cadd-icon-option-active" : ""
                          }`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                    {errors.icon && <p className="cadd-error-text mt-2">{errors.icon}</p>}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="cadd-section">
                <p className="cadd-section-title">Settings</p>
                <div className="cadd-field">
                  <label htmlFor="c-status" className="cadd-label">
                    Status
                  </label>
                  <div className="cadd-select-wrapper">
                    <select
                      id="c-status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="cadd-select"
                    >
                      <option value="draft">Draft – hidden from users</option>
                      <option value="active">Active – visible to users</option>
                    </select>
                    <ChevronDown className="cadd-select-chevron" aria-hidden="true" />
                  </div>
                  <p className="cadd-hint">
                    Draft categories won't appear on the public categories page.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: actions + preview ── */}
            <div className="cadd-sidebar-col">

              {/* Save options */}
              <div className="cadd-actions-card">
                <p className="cadd-actions-title">Save Options</p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave("active")}
                  className="cadd-publish-button"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {loading ? "Saving…" : "Publish Category"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave("draft")}
                  className="cadd-draft-button"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Save as Draft
                </button>
                <Link to="/admin/categories" className="cadd-cancel-link">
                  Cancel
                </Link>

                <div className="mt-4 space-y-0">
                  <div className="cadd-meta-row">
                    <span className="cadd-meta-label">Status</span>
                    <span className="cadd-meta-value">{form.status}</span>
                  </div>
                  <div className="cadd-meta-row">
                    <span className="cadd-meta-label">Slug</span>
                    <span className="cadd-meta-value font-mono text-xs">
                      {form.slug || "—"}
                    </span>
                  </div>
                  <div className="cadd-meta-row">
                    <span className="cadd-meta-label">Icon</span>
                    <span className="cadd-meta-value">{form.icon || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <div className="cadd-preview-card">
                <p className="cadd-preview-title">Live Preview</p>
                <LivePreview form={form} />
              </div>
            </div>
          </div>
        </main>

        <footer className="admin-footer">
          <div className="admin-footer-inner">
            <span>VoucherPro Admin v2.4.1 Build 9982</span>
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

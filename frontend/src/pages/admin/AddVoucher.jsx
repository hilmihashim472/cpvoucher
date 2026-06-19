import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ChevronDown, ImagePlus, Send, FileText } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import API_BASE_URL from "../../config/api";

const CATEGORIES = [
  "Food & Beverage",
  "Fashion",
  "Tech",
  "Travel",
  "Beauty",
  "Home",
];

const INITIAL_FORM = {
  title: "",
  brand: "",
  category: "",
  description: "",
  points: "",
  stock: "",
  expiry: "",
  terms: "",
  status: "draft",
};

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required.";
  if (!form.brand.trim()) errors.brand = "Brand name is required.";
  if (!form.category) errors.category = "Please select a category.";
  if (!form.description.trim()) errors.description = "Description is required.";
  if (!form.points || Number(form.points) <= 0)
    errors.points = "Enter a valid points cost.";
  if (!form.stock || Number(form.stock) <= 0)
    errors.stock = "Enter a valid stock quantity.";
  if (!form.expiry) errors.expiry = "Expiry date is required.";
  else if (new Date(form.expiry) <= new Date())
    errors.expiry = "Expiry date must be in the future.";
  return errors;
}

function LivePreview({ form }) {
  const hasContent = form.title || form.brand || form.category;

  if (!hasContent) {
    return (
      <p className="vadd-preview-empty">
        Start filling in the form to see a preview of your voucher card.
      </p>
    );
  }

  return (
    <div className="vadd-preview-voucher">
      <div className="vadd-preview-top">
        <span className="vadd-preview-category">
          {form.category || "Category"}
        </span>
        <span className="vadd-preview-status">{form.status}</span>
      </div>
      <p className="vadd-preview-brand">{form.brand || "Brand Name"}</p>
      <p className="vadd-preview-voucher-title">
        {form.title || "Voucher title will appear here"}
      </p>
      {form.description && (
        <p className="vadd-preview-desc">{form.description}</p>
      )}
      <div className="vadd-preview-footer">
        <div>
          <p className="vadd-preview-pts">
            {form.points ? Number(form.points).toLocaleString() : "—"} pts
          </p>
          <p className="vadd-preview-pts-label">Points required</p>
        </div>
        <span className="vadd-preview-cta">Get Code</span>
      </div>
    </div>
  );
}

export default function AddVoucher() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
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
      await axios.post(`${API_BASE_URL}/admin/vouchers`, { ...form, status });
      toast.success(
        status === "active" ? "Voucher published successfully!" : "Saved as draft."
      );
      navigate("/admin/vouchers");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Failed to save voucher. Please try again.";
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
          <div className="vadd-header">
            <div>
              <Link to="/admin/vouchers" className="vadd-back-link">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Vouchers
              </Link>
              <h1 className="vadd-title">Add New Voucher</h1>
              <p className="vadd-subtitle">
                Fill in the details below to create and publish a voucher.
              </p>
            </div>
          </div>

          <div className="vadd-layout">
            {/* ── Left: form ── */}
            <div className="vadd-form-col">

              {/* Basic Information */}
              <div className="vadd-section">
                <p className="vadd-section-title">Basic Information</p>
                <div className="space-y-4">
                  <div className="vadd-field">
                    <label htmlFor="v-title" className="vadd-label">
                      Voucher Title <span className="vadd-required">*</span>
                    </label>
                    <input
                      id="v-title"
                      name="title"
                      type="text"
                      placeholder="e.g. Buy 1 Get 1 Free – Starbucks"
                      value={form.title}
                      onChange={handleChange}
                      className={`vadd-input ${errors.title ? "vadd-input-error" : ""}`}
                    />
                    {errors.title && <p className="vadd-error-text">{errors.title}</p>}
                  </div>

                  <div className="vadd-grid-2">
                    <div className="vadd-field">
                      <label htmlFor="v-brand" className="vadd-label">
                        Brand / Merchant <span className="vadd-required">*</span>
                      </label>
                      <input
                        id="v-brand"
                        name="brand"
                        type="text"
                        placeholder="e.g. Starbucks"
                        value={form.brand}
                        onChange={handleChange}
                        className={`vadd-input ${errors.brand ? "vadd-input-error" : ""}`}
                      />
                      {errors.brand && <p className="vadd-error-text">{errors.brand}</p>}
                    </div>

                    <div className="vadd-field">
                      <label htmlFor="v-category" className="vadd-label">
                        Category <span className="vadd-required">*</span>
                      </label>
                      <div className="vadd-select-wrapper">
                        <select
                          id="v-category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className={`vadd-select ${errors.category ? "vadd-select-error" : ""}`}
                        >
                          <option value="">Select a category</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown className="vadd-select-chevron" aria-hidden="true" />
                      </div>
                      {errors.category && <p className="vadd-error-text">{errors.category}</p>}
                    </div>
                  </div>

                  <div className="vadd-field">
                    <label htmlFor="v-description" className="vadd-label">
                      Description <span className="vadd-required">*</span>
                    </label>
                    <textarea
                      id="v-description"
                      name="description"
                      rows={3}
                      placeholder="Briefly describe what this voucher offers…"
                      value={form.description}
                      onChange={handleChange}
                      className={`vadd-textarea ${errors.description ? "vadd-textarea-error" : ""}`}
                    />
                    {errors.description && (
                      <p className="vadd-error-text">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Availability */}
              <div className="vadd-section">
                <p className="vadd-section-title">Pricing & Availability</p>
                <div className="vadd-grid-3">
                  <div className="vadd-field">
                    <label htmlFor="v-points" className="vadd-label">
                      Points Cost <span className="vadd-required">*</span>
                    </label>
                    <input
                      id="v-points"
                      name="points"
                      type="number"
                      min="1"
                      placeholder="e.g. 500"
                      value={form.points}
                      onChange={handleChange}
                      className={`vadd-input ${errors.points ? "vadd-input-error" : ""}`}
                    />
                    {errors.points && <p className="vadd-error-text">{errors.points}</p>}
                  </div>

                  <div className="vadd-field">
                    <label htmlFor="v-stock" className="vadd-label">
                      Stock Quantity <span className="vadd-required">*</span>
                    </label>
                    <input
                      id="v-stock"
                      name="stock"
                      type="number"
                      min="1"
                      placeholder="e.g. 200"
                      value={form.stock}
                      onChange={handleChange}
                      className={`vadd-input ${errors.stock ? "vadd-input-error" : ""}`}
                    />
                    {errors.stock && <p className="vadd-error-text">{errors.stock}</p>}
                  </div>

                  <div className="vadd-field">
                    <label htmlFor="v-expiry" className="vadd-label">
                      Expiry Date <span className="vadd-required">*</span>
                    </label>
                    <input
                      id="v-expiry"
                      name="expiry"
                      type="date"
                      value={form.expiry}
                      onChange={handleChange}
                      className={`vadd-input ${errors.expiry ? "vadd-input-error" : ""}`}
                    />
                    {errors.expiry && <p className="vadd-error-text">{errors.expiry}</p>}
                  </div>
                </div>
                <p className="vadd-hint mt-3">
                  Vouchers expire at midnight on the selected date. Stock depletes
                  as users redeem codes.
                </p>
              </div>

              {/* Terms & Conditions */}
              <div className="vadd-section">
                <p className="vadd-section-title">Terms & Conditions</p>
                <div className="vadd-field">
                  <label htmlFor="v-terms" className="vadd-label">
                    Terms <span className="text-muted text-xs normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="v-terms"
                    name="terms"
                    rows={4}
                    placeholder="e.g. Valid for dine-in only. Not combinable with other offers. One redemption per customer per day."
                    value={form.terms}
                    onChange={handleChange}
                    className="vadd-textarea"
                  />
                  <p className="vadd-hint">
                    Shown to users before they redeem. Keep it clear and concise.
                  </p>
                </div>
              </div>

              {/* Brand Image */}
              <div className="vadd-section">
                <p className="vadd-section-title">Brand Image</p>
                <button
                  type="button"
                  className="vadd-image-drop w-full"
                  onClick={() => toast("Image upload will be available soon.")}
                >
                  <ImagePlus className="vadd-image-icon" aria-hidden="true" />
                  <p className="vadd-image-label">
                    <span className="vadd-image-browse">Click to upload</span>{" "}
                    or drag and drop
                  </p>
                  <p className="vadd-image-hint">PNG, JPG or WebP · Max 2 MB</p>
                </button>
              </div>
            </div>

            {/* ── Right: actions + preview ── */}
            <div className="vadd-sidebar-col">

              {/* Actions */}
              <div className="vadd-actions-card">
                <p className="vadd-actions-title">Save Options</p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave("active")}
                  className="vadd-publish-button"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {loading ? "Saving…" : "Publish Voucher"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave("draft")}
                  className="vadd-draft-button"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Save as Draft
                </button>
                <Link to="/admin/vouchers" className="vadd-cancel-link">
                  Cancel
                </Link>

                <div className="mt-4 space-y-2">
                  <div className="vadd-meta-row">
                    <span className="vadd-meta-label">Status</span>
                    <span
                      className={`vadd-meta-value ${
                        form.status === "active"
                          ? "vadd-meta-value-active"
                          : "vadd-meta-value-draft"
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>
                  <div className="vadd-meta-row">
                    <span className="vadd-meta-label">Category</span>
                    <span className="vadd-meta-value">{form.category || "—"}</span>
                  </div>
                  <div className="vadd-meta-row">
                    <span className="vadd-meta-label">Stock</span>
                    <span className="vadd-meta-value">
                      {form.stock ? Number(form.stock).toLocaleString() : "—"}
                    </span>
                  </div>
                  <div className="vadd-meta-row">
                    <span className="vadd-meta-label">Expires</span>
                    <span className="vadd-meta-value">{form.expiry || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="vadd-preview-card">
                <p className="vadd-preview-title">Live Preview</p>
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

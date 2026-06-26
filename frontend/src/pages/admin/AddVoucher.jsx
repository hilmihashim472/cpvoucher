import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronDown,
  ImagePlus,
  Send,
  Link2,
  Upload,
  Sparkles,
  Loader2,
  X,
  Info,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth.jsx";
import API_BASE_URL from "../../config/api";

const INITIAL_FORM = {
  title: "",
  brand: "",
  category_id: "",
  description: "",
  points: "",
  code: "",
  discountAmount: "",
  storeName: "",
  tagline: "",
  brandUrl: "",
  expiresAt: "",
  quantity: "",
  image: "",
  status: "draft",
};

// Helper to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL.replace("/api", "")}${imagePath}`;
};

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required.";
  if (!form.brand.trim()) errors.brand = "Brand name is required.";
  if (!form.category_id) errors.category_id = "Please select a category.";
  if (!form.description.trim()) errors.description = "Description is required.";
  if (!form.points || Number(form.points) <= 0)
    errors.points = "Enter a valid points cost.";
  // Code is optional - auto-generated from timestamp if not provided
  if (!form.quantity || Number(form.quantity) < 1)
    errors.quantity = "Quantity must be at least 1.";
  if (!form.expiresAt) errors.expiresAt = "Expiry date is required.";
  else if (new Date(form.expiresAt) <= new Date())
    errors.expiresAt = "Expiry date must be in the future.";
  return errors;
}

function LivePreview({ form, categories }) {
  const category = categories.find((c) => c._id === form.category_id);
  const hasContent = form.title || form.brand;

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
          {category?.name || "Category"}
        </span>
        <span className="vadd-preview-status">{form.status}</span>
      </div>
      <p className="vadd-preview-brand">{form.brand || "Brand Name"}</p>
      <p className="vadd-preview-voucher-title">
        {form.title || "Voucher title will appear here"}
      </p>
      {form.description && <p className="vadd-preview-desc">{form.description}</p>}
      <div className="vadd-preview-footer">
        <div>
          <p className="vadd-preview-pts">
            {form.points ? Number(form.points).toLocaleString() : "—"} pts
          </p>
          <p className="vadd-preview-pts-label">Points required</p>
        </div>
        <span className="vadd-preview-cta">Get Code</span>
      </div>
      {form.quantity && (
        <p className="text-xs text-muted mt-2">{form.quantity} available</p>
      )}
    </div>
  );
}

export default function AddVoucher() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const voucherId = searchParams.get("id");
  const isEdit = !!voucherId;

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    code: isEdit ? "" : "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(isEdit);

  // Image states
  const [imageMode, setImageMode] = useState("url");
  const [uploading, setUploading] = useState(false);

  // AI states
  const [generating, setGenerating] = useState(false);

  // Fetch categories
  useEffect(() => {
    api
      .get("/admin/categories?limit=100")
      .then((res) => {
        setCategories(res.data.categories || []);
      })
      .catch(() => {
        toast.error("Failed to load categories");
      });
  }, [api]);

  // Fetch voucher data if editing
  useEffect(() => {
    if (!voucherId) return;

    api
      .get(`/admin/vouchers/${voucherId}`)
      .then((res) => {
        const v = res.data;
        setForm({
          title: v.title || "",
          brand: v.brand || "",
          category_id: v.category_id?._id || v.category_id || "",
          description: v.description || "",
          points: v.points || "",
          code: v.code || "",
          discountAmount: v.discountAmount || "",
          storeName: v.storeName || "",
          tagline: v.tagline || "",
          brandUrl: v.brandUrl || "",
          expiresAt: v.expiresAt
            ? new Date(v.expiresAt).toISOString().split("T")[0]
            : "",
          quantity: v.quantity || "",
          image: v.image || "",
          status: v.status || "draft",
        });

        // Detect image mode
        if (v.image && v.image.startsWith("/uploads/")) {
          setImageMode("upload");
        } else if (v.image) {
          setImageMode("url");
        }
      })
      .catch(() => {
        toast.error("Failed to load voucher");
        navigate("/admin/vouchers");
      })
      .finally(() => setLoadingData(false));
  }, [voucherId, api, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/admin/vouchers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image: data.imageUrl }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // AI Generate Description
  const handleGenerateDescription = async () => {
    if (!form.title || !form.brand) {
      toast.error("Please fill in title and brand first");
      return;
    }

    setGenerating(true);
    try {
      const { data } = await api.post("/admin/vouchers/generate-description", {
        title: form.title,
        brand: form.brand,
        category: categories.find((c) => c._id === form.category_id)?.name,
        points: form.points,
        discountAmount: form.discountAmount,
      });
      setForm((prev) => ({ ...prev, description: data.description }));
      toast.success("✨ Description generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate description");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    const next = validate(form);
    if (Object.keys(next).length > 0) {
      setErrors(next);
      toast.error("Please fix the highlighted errors before saving.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        points: Number(form.points),
        discountAmount: form.discountAmount ? Number(form.discountAmount) : 0,
        quantity: Number(form.quantity),
        expiresAt: new Date(form.expiresAt),
      };

      if (isEdit) {
        await api.patch(`/admin/vouchers/${voucherId}`, payload);
        toast.success("Voucher updated successfully!");
      } else {
        await api.post("/admin/vouchers", payload);
        toast.success("Voucher created successfully!");
      }
      navigate("/admin/vouchers");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Failed to save voucher. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
  };

  if (loadingData) {
    return (
      <div className="admin-shell">
        <Sidebar />
        <div className="admin-content">
          <main className="admin-main p-6 lg:p-8">
            <p className="text-gray-500">Loading voucher...</p>
          </main>
        </div>
      </div>
    );
  }

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
              <h1 className="vadd-title">
                {isEdit ? "Edit Voucher" : "Add New Voucher"}
              </h1>
              <p className="vadd-subtitle">
                {isEdit
                  ? "Update the voucher details below."
                  : "Fill in the details below to create and publish a voucher."}
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
                      <label htmlFor="v-category_id" className="vadd-label">
                        Category <span className="vadd-required">*</span>
                      </label>
                      <div className="vadd-select-wrapper">
                        <select
                          id="v-category_id"
                          name="category_id"
                          value={form.category_id}
                          onChange={handleChange}
                          className={`vadd-select ${errors.category_id ? "vadd-select-error" : ""}`}
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="vadd-select-chevron" aria-hidden="true" />
                      </div>
                      {errors.category_id && (
                        <p className="vadd-error-text">{errors.category_id}</p>
                      )}
                    </div>
                  </div>

                  {/* Description with AI Generate */}
                  <div className="vadd-field">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="v-description" className="vadd-label mb-0">
                        Description <span className="vadd-required">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={generating}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" />
                            AI Generate
                          </>
                        )}
                      </button>
                    </div>
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
                    <p className="vadd-hint">
                      💡 Tip: Fill in the title and brand first, then click AI Generate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Code & Pricing */}
              <div className="vadd-section">
                <p className="vadd-section-title">Code & Pricing</p>
                <div className="vadd-grid-3">
                  <div className="vadd-field">
                    <label htmlFor="v-code" className="vadd-label">
                      Voucher Code <span className="vadd-required">*</span>
                    </label>
                    <input
                      id="v-code"
                      name="code"
                      type="text"
                      placeholder="Auto-generated from title, brand & category"
                      value={form.code}
                      disabled
                      className={`vadd-input font-mono uppercase bg-gray-50 text-gray-600 cursor-not-allowed`}
                    />
                    <p className="vadd-hint">
                      🔒 Auto-generated based on your voucher details.
                    </p>
                  </div>

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
                    <label htmlFor="v-discountAmount" className="vadd-label">
                      Discount Amount
                      <span className="vadd-discount-tooltip-wrapper">
                        <Info className="vadd-discount-info-icon" aria-hidden="true" />
                        <span className="vadd-discount-tooltip">
                          <strong>What is this?</strong><br />
                          For <em>percentage-off vouchers</em>, enter the discount percentage.<br />
                          E.g., "Adidas 30% off" → <strong>30</strong> | "Free 3 months Spotify" → <strong>100</strong><br /><br />
                          For <em>flat-price vouchers</em> (e.g., "Apple Store $100 Off"), leave as <strong>0</strong>.<br /><br />
                          This value is used to calculate the <strong>Avg Discount</strong> in Analytics.
                        </span>
                      </span>
                    </label>
                    <input
                      id="v-discountAmount"
                      name="discountAmount"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 10"
                      value={form.discountAmount}
                      onChange={handleChange}
                      className="vadd-input"
                    />
                  </div>
                </div>
              </div>

              {/* Availability & Status */}
              <div className="vadd-section">
                <p className="vadd-section-title">Availability & Status</p>
                <div className="vadd-grid-3">
                  <div className="vadd-field">
                    <label htmlFor="v-quantity" className="vadd-label">
                      Quantity <span className="vadd-required">*</span>
                    </label>
                    <input
                      id="v-quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={form.quantity}
                      onChange={handleChange}
                      className={`vadd-input ${errors.quantity ? "vadd-input-error" : ""}`}
                    />
                    {errors.quantity && (
                      <p className="vadd-error-text">{errors.quantity}</p>
                    )}
                    <p className="vadd-hint">Total vouchers available to users</p>
                  </div>

                  <div className="vadd-field">
                    <label htmlFor="v-expiresAt" className="vadd-label">
                      Expiry Date <span className="vadd-required">*</span>
                    </label>
                    <input
                      id="v-expiresAt"
                      name="expiresAt"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={form.expiresAt}
                      onChange={handleChange}
                      className={`vadd-input ${errors.expiresAt ? "vadd-input-error" : ""}`}
                    />
                    {errors.expiresAt && (
                      <p className="vadd-error-text">{errors.expiresAt}</p>
                    )}
                  </div>

                  <div className="vadd-field">
                    <label htmlFor="v-status" className="vadd-label">
                      Status
                    </label>
                    <div className="vadd-select-wrapper">
                      <select
                        id="v-status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="vadd-select"
                      >
                        <option value="draft">Draft – hidden from users</option>
                        <option value="active">Active – visible to users</option>
                      </select>
                      <ChevronDown className="vadd-select-chevron" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="vadd-section">
                <p className="vadd-section-title">Additional Details</p>
                <div className="space-y-4">
                  <div className="vadd-grid-2">
                    <div className="vadd-field">
                      <label htmlFor="v-storeName" className="vadd-label">
                        Store Name
                      </label>
                      <input
                        id="v-storeName"
                        name="storeName"
                        type="text"
                        placeholder="e.g. Starbucks KLCC"
                        value={form.storeName}
                        onChange={handleChange}
                        className="vadd-input"
                      />
                    </div>

                    <div className="vadd-field">
                      <label htmlFor="v-tagline" className="vadd-label">
                        Tagline
                      </label>
                      <input
                        id="v-tagline"
                        name="tagline"
                        type="text"
                        placeholder="e.g. Best coffee in town"
                        value={form.tagline}
                        onChange={handleChange}
                        className="vadd-input"
                      />
                    </div>
                  </div>

                  <div className="vadd-field">
                    <label htmlFor="v-brandUrl" className="vadd-label">
                      Brand URL
                    </label>
                    <input
                      id="v-brandUrl"
                      name="brandUrl"
                      type="url"
                      placeholder="e.g. https://starbucks.com"
                      value={form.brandUrl}
                      onChange={handleChange}
                      className="vadd-input"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Image */}
              <div className="vadd-section">
                <p className="vadd-section-title">Brand Image</p>

                {/* Toggle between URL and Upload */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      imageMode === "url"
                        ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Link2 className="h-4 w-4" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      imageMode === "upload"
                        ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload File
                  </button>
                </div>

                {imageMode === "url" ? (
                  <div className="vadd-field">
                    <input
                      name="image"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={form.image}
                      onChange={handleChange}
                      className="vadd-input"
                    />
                    <p className="vadd-hint mt-2">
                      Enter a direct link to an image (PNG, JPG, or WebP).
                    </p>
                  </div>
                ) : (
                  <div className="vadd-field">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="vadd-image-drop w-full cursor-pointer"
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-10 w-10 text-muted animate-spin" />
                          <p className="vadd-image-label">Uploading...</p>
                        </div>
                      ) : form.image ? (
                        <div className="relative w-full">
                          <img
                            src={getImageUrl(form.image)}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              clearImage();
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <ImagePlus className="vadd-image-icon" aria-hidden="true" />
                          <p className="vadd-image-label">
                            <span className="vadd-image-browse">Click to upload</span> or
                            drag and drop
                          </p>
                          <p className="vadd-image-hint">PNG, JPG or WebP · Max 2 MB</p>
                        </>
                      )}
                    </label>
                  </div>
                )}

                {/* Image preview for URL mode */}
                {imageMode === "url" && form.image && (
                  <div className="mt-4 relative">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-contain border border-line"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
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
                  onClick={handleSave}
                  className="vadd-publish-button"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {loading ? "Saving…" : isEdit ? "Update Voucher" : "Save Voucher"}
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
                    <span className="vadd-meta-value">
                      {categories.find((c) => c._id === form.category_id)?.name || "—"}
                    </span>
                  </div>
                  <div className="vadd-meta-row">
                    <span className="vadd-meta-label">Points</span>
                    <span className="vadd-meta-value">
                      {form.points ? Number(form.points).toLocaleString() : "—"}
                    </span>
                  </div>
                  <div className="vadd-meta-row">
                    <span className="vadd-meta-label">Quantity</span>
                    <span className="vadd-meta-value">
                      {form.quantity ? Number(form.quantity).toLocaleString() : "—"}
                    </span>
                  </div>
                  <div className="vadd-meta-row">
                    <span className="vadd-meta-label">Code</span>
                    <span className="vadd-meta-value font-mono text-xs">
                      {form.code || "—"}
                    </span>
                  </div>
                  <div className="vadd-meta-row">
                    <span className="vadd-meta-label">Expires</span>
                    <span className="vadd-meta-value">
                      {form.expiresAt
                        ? new Date(form.expiresAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="vadd-preview-card">
                <p className="vadd-preview-title">Live Preview</p>
                <LivePreview form={form} categories={categories} />
              </div>
            </div>
          </div>
        </main>

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
// models/Voucher.js
const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    points: { type: Number, required: true, min: 0 },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: String, required: true },
    discountAmount: { type: Number, default: 0 },
    code: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    storeName: { type: String },
    tagline: { type: String },
    brandUrl: { type: String },
    usageCount: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 }, // NEW: Total quantity available
    status: { type: String, enum: ["active", "draft"], default: "draft" }, // NEW: Status field
  },
  { timestamps: true }
);

// Virtual field to check if voucher is fully claimed
voucherSchema.virtual("isFullyClaimed").get(function () {
  return this.usageCount >= this.quantity;
});

// Virtual field to check if voucher is expired
voucherSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt;
});

// Virtual field for effective status (combines manual status + auto checks)
voucherSchema.virtual("effectiveStatus").get(function () {
  if (this.status === "draft") return "draft";
  if (this.isExpired) return "expired";
  if (this.isFullyClaimed) return "fully-claimed";
  return "active";
});

// Ensure virtuals are included in JSON responses
voucherSchema.set("toJSON", { virtuals: true });
voucherSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Voucher", voucherSchema);
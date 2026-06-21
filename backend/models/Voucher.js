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
    }, // FK
    brand: { type: String, required: true },
    discountAmount: { type: Number, default: 0 },
    code: { type: String, required: true, unique: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    storeName: { type: String },
    tagline: { type: String },
    brandUrl: { type: String },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Voucher", voucherSchema);

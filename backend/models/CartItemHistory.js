const mongoose = require("mongoose");

const cartHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher", required: true },
  quantity: { type: Number, min: 1, required: true },
  pointsUsed: { type: Number, required: true }, // Points spent on this item
  discountAmount: { type: Number, default: 0 }, // Total discount value
  timestamp: { type: Date, default: Date.now },
  receiptUrl: { type: String }, // Link to PDF receipt
  orderNumber: { type: String, required: true }, // Unique order ID
});

module.exports = mongoose.model("CartItemHistory", cartHistorySchema);
// models/CartItemHistory.js  — order history after checkout
const mongoose = require("mongoose");
const cartHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
  quantity: { type: Number, min: 1 },
  timestamp: { type: Date, default: Date.now }, // when it was redeemed
});
module.exports = mongoose.model("CartItemHistory", cartHistorySchema);

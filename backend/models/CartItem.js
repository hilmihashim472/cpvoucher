// models/CartItem.js  — the CURRENT cart
const mongoose = require("mongoose");
const cartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
  quantity: { type: Number, default: 1, min: 1 },
});
module.exports = mongoose.model("CartItem", cartItemSchema);

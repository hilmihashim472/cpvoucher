const CartItem = require("../models/CartItem");
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const CartItemHistory = require('../models/CartItemHistory');

const redeemVouchers = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Fetch cart items to calculate points on the server (Security & Accuracy)
    const cartItems = await CartItem.find({ user: userId }).populate('voucher');
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const serverTotalPoints = cartItems.reduce((acc, item) => {
      const discount = item.voucher?.discountAmount || 0;
      return acc + (discount * 10 * item.quantity);
    }, 0);

    console.log(`User ${user.username} (ID: ${userId}) attempting to redeem. Current: ${user.points}, Required: ${serverTotalPoints}`);

    // 2. Server-side validation
    if (user.points < serverTotalPoints) {
      return res.status(400).json({ message: "Insufficient points balance" });
    }

    // 3. Deduction Logic
    user.points -= serverTotalPoints;

    // 4. Persist the change to the User collection
    await user.save();

    // 5. Create history records
    const historyRecords = cartItems.map(item => ({
      user: userId,
      voucher: item.voucher._id,
      quantity: item.quantity,
      timestamp: new Date()
    }));

    await CartItemHistory.insertMany(historyRecords);
    await CartItem.deleteMany({ user: userId });

    // 6. Return the updated point balance to the frontend
    res.status(200).json({ 
      message: "Redemption successful", 
      newBalance: user.points 
    });

  } catch (error) {
    console.error("Redeem Error:", error);
    res.status(500).json({ message: "Internal server error during redemption" });
  }
};

// Fetch all items in the user's cart
exports.getCartItems = async (req, res) => {
  try {
    const items = await CartItem.find({ user: req.userId }).populate("voucher");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { voucherId, quantity = 1 } = req.body;

    if (!voucherId) {
      return res.status(400).json({ message: "voucherId is required" });
    }

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    const qty = Number(quantity) || 1;
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity must be a positive integer" });
    }

    let cartItem = await CartItem.findOne({ user: req.userId, voucher: voucherId });

    if (cartItem) {
      cartItem.quantity += qty;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        user: req.userId,
        voucher: voucherId,
        quantity: qty,
      });
    }

    await cartItem.populate("voucher");
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const qty = Number(req.body.quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity must be a positive integer" });
    }

    // Improved: Ensure the cart item belongs to the authenticated user
    const cartItem = await CartItem.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { quantity: qty },
      { new: true }
    ).populate("voucher");

    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    res.json(cartItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    // Improved: Ensure the cart item belongs to the authenticated user
    const cartItem = await CartItem.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch the redemption history for the user
exports.getOrderHistory = async (req, res) => {
  try {
    const history = await CartItemHistory.find({ user: req.userId })
      .populate("voucher")
      .sort("-timestamp");
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.redeemVouchers = redeemVouchers;
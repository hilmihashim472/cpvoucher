const CartItem = require("../models/CartItem");
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const CartItemHistory = require("../models/CartItemHistory");
const { generateReceiptPDF } = require("../services/receiptService");
const { sendReceiptEmail } = require("../services/emailService");

const redeemVouchers = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Fetch cart items
    const cartItems = await CartItem.find({ user: userId }).populate("voucher");

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 2. Calculate total points
    const serverTotalPoints = cartItems.reduce((acc, item) => {
      const points = item.voucher?.points || 0;
      return acc + points * item.quantity;
    }, 0);

    console.log(
      `User ${user.username} attempting to redeem. Current: ${user.points}, Required: ${serverTotalPoints}`,
    );

    // 3. Validate points
    if (user.points < serverTotalPoints) {
      return res.status(400).json({ message: "Insufficient points balance" });
    }

    // 4. Validate voucher quantities
    for (const item of cartItems) {
      const voucher = item.voucher;
      if (!voucher) {
        return res.status(400).json({ message: `Voucher not found for cart item` });
      }
      
      const availableQuantity = voucher.quantity - voucher.usageCount;
      if (item.quantity > availableQuantity) {
        return res.status(400).json({ 
          message: `Insufficient quantity for "${voucher.title}". Available: ${availableQuantity}, Requested: ${item.quantity}` 
        });
      }
    }

    // 5. Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${userId.toString().slice(-6).toUpperCase()}`;

    // 6. Deduct points
    user.points -= serverTotalPoints;
    await user.save();

    // 7. Update voucher usage counts
    for (const item of cartItems) {
      await Voucher.findByIdAndUpdate(item.voucher._id, {
        $inc: { usageCount: item.quantity }
      });
    }

    // 8. Create history records with receipt info
    const historyRecords = cartItems.map((item) => ({
      user: userId,
      voucher: item.voucher._id,
      quantity: item.quantity,
      pointsUsed: item.voucher.points * item.quantity,
      discountAmount: (item.voucher.discountAmount || 0) * item.quantity,
      orderNumber: orderNumber,
      timestamp: new Date(),
    }));

    const savedHistory = await CartItemHistory.insertMany(historyRecords);

    // 7. Generate PDF receipt
    const orderData = {
      orderNumber,
      items: cartItems,
      totalPoints: serverTotalPoints,
      timestamp: new Date(),
    };

    const pdfResult = await generateReceiptPDF(orderData, user);

    // 8. Update history records with receipt URL
    await CartItemHistory.updateMany(
      { orderNumber: orderNumber },
      { receiptUrl: pdfResult.url },
    );

    // 9. Send email with PDF attachment
    try {
      await sendReceiptEmail(user, orderData, pdfResult.filepath);
      console.log("✅ Receipt email sent to", user.email);
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError);
      // Don't fail the whole request if email fails
    }

    // 10. Clear cart
    await CartItem.deleteMany({ user: userId });

    // 11. Return response
    res.status(200).json({
      message: "Redemption successful",
      newBalance: user.points,
      orderNumber: orderNumber,
      receiptUrl: pdfResult.url,
    });
  } catch (error) {
    console.error("Redeem Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during redemption" });
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
      return res
        .status(400)
        .json({ message: "quantity must be a positive integer" });
    }

    // Check if voucher is still available
    const now = new Date();
    if (
      voucher.status !== "active" ||
      voucher.expiresAt < now ||
      voucher.usageCount >= voucher.quantity
    ) {
      return res.status(400).json({ message: "This voucher is no longer available" });
    }

    // Check if requested quantity exceeds available quantity
    const availableQuantity = voucher.quantity - voucher.usageCount;
    const existingCartItem = await CartItem.findOne({
      user: req.userId,
      voucher: voucherId,
    });
    const currentCartQty = existingCartItem ? existingCartItem.quantity : 0;
    const totalRequestedQty = currentCartQty + qty;

    if (totalRequestedQty > availableQuantity) {
      return res.status(400).json({ 
        message: `Only ${availableQuantity} voucher(s) available. You have ${currentCartQty} in your cart.` 
      });
    }

    let cartItem = await CartItem.findOne({
      user: req.userId,
      voucher: voucherId,
    });

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
      return res
        .status(400)
        .json({ message: "quantity must be a positive integer" });
    }

    // Improved: Ensure the cart item belongs to the authenticated user
    const cartItem = await CartItem.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { quantity: qty },
      { new: true },
    ).populate("voucher");

    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    // Validate that the updated quantity doesn't exceed available quantity
    const voucher = cartItem.voucher;
    if (voucher) {
      const availableQuantity = voucher.quantity - voucher.usageCount;
      if (qty > availableQuantity) {
        return res.status(400).json({ 
          message: `Only ${availableQuantity} voucher(s) available` 
        });
      }
    }

    res.json(cartItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    // Improved: Ensure the cart item belongs to the authenticated user
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.redeemVouchers = redeemVouchers;

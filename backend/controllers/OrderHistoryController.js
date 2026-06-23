const CartItemHistory = require("../models/CartItemHistory");
const User = require("../models/User");
const Voucher = require("../models/Voucher");

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

exports.getAdminOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Handle Sorting Logic here
    let sortField = req.query.sort || "timestamp";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    // Map frontend keys to DB keys
    const fieldMapping = {
      "id": "orderNumber",
      "points": "pointsUsed",
      "date": "timestamp",
      "createdAt": "createdAt",
      "timestamp": "timestamp"
    };
    const dbSortField = fieldMapping[sortField] || "timestamp";

    // 2. Handle Search Logic here
    const search = req.query.search || "";
    const query = {};

    if (search) {
      // Find matching Users
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      // Find matching Vouchers
      const matchingVouchers = await Voucher.find({
        title: { $regex: search, $options: "i" }
      }).select("_id");

      // Combine into OR query
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { user: { $in: matchingUsers.map(u => u._id) } },
        { voucher: { $in: matchingVouchers.map(v => v._id) } }
      ];
    }

    // 3. Execute Database Query
    const orders = await CartItemHistory.find(query)
      .populate("user", "username fullName email")
      .populate("voucher", "title brand points")
      .sort({ [dbSortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await CartItemHistory.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error in getAdminOrders:", err);
    res.status(500).json({ message: err.message });
  }
};


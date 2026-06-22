const router = require("express").Router();
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");
const voucherController = require("../controllers/voucherController");
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");
const { voucherUpload, handleUploadError } = require("../middleware/upload");
const { uploadVoucherImage } = require("../controllers/uploadController"); // ← ADD THIS
const User = require("../models/User");
const Voucher = require("../models/Voucher");
const Category = require("../models/Category");
const CartItem = require("../models/CartItem");
const CartItemHistory = require("../models/CartItemHistory");

// Protect all admin routes
router.use(auth, adminOnly);

// ==========================================
// VOUCHER MANAGEMENT
// ==========================================
router.get("/vouchers", voucherController.getVouchersAdmin);
router.get("/vouchers/:id", voucherController.getVoucherByIdAdmin);
router.post("/vouchers", voucherController.createVoucher);
router.patch("/vouchers/:id", voucherController.updateVoucher);
router.delete("/vouchers/:id", voucherController.deleteVoucher);

// ✅ Voucher image upload - uses voucherUpload middleware + uploadController
router.post(
  "/vouchers/upload",
  voucherUpload.single("image"),
  handleUploadError,
  uploadVoucherImage // ← USE uploadController function
);

// AI Generate Description
router.post("/vouchers/generate-description", voucherController.generateDescription);
router.post("/categories/generate-description", categoryController.generateCategoryDescription);

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================
router.post("/categories", categoryController.createCategory);
router.get("/categories", categoryController.getCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.patch("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// ==========================================
// USER MANAGEMENT
// ==========================================
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const search = req.query.search || "";
    const roleFilter = req.query.role || "";

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }
    if (roleFilter && roleFilter !== "All") {
      query.role = roleFilter.toLowerCase();
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ message: "You cannot modify your own account here." });
    }

    const { role, is_active, fullName, email, points } = req.body;
    const updateData = {};

    if (role && ["user", "admin"].includes(role)) updateData.role = role;
    if (typeof is_active === "boolean") updateData.is_active = is_active;
    if (typeof fullName === "string") updateData.fullName = fullName.trim();
    if (typeof points === "number") updateData.points = points;

    if (email) {
      const nextEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: nextEmail, _id: { $ne: req.params.id } });
      if (existingUser) return res.status(409).json({ message: "Email is already in use" });
      updateData.email = nextEmail;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/users", authController.adminCreateUser);

// ==========================================
// ORDER MANAGEMENT
// ==========================================
router.get("/orders", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const search = req.query.search || "";

    // Map frontend field names to database fields
    const fieldMapping = {
      "id": "orderNumber",
      "points": "pointsUsed",
      "date": "timestamp"
    };
    const dbSortField = fieldMapping[sortField] || sortField;

    const query = {};
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
      ];
      // Also search by related user or voucher
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
        ]
      }).select("_id");
      const matchingVouchers = await Voucher.find({
        title: { $regex: search, $options: "i" }
      }).select("_id");

      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { user: { $in: matchingUsers.map(u => u._id) } },
        { voucher: { $in: matchingVouchers.map(v => v._id) } },
      ];
    }

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
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// DASHBOARD STATISTICS
// ==========================================
// ==========================================
// ANALYTICS & REPORTS
// ==========================================
router.get("/analytics", async (req, res) => {
  try {
    // Redemption trends - monthly aggregation
    const redemptionTrends = await CartItemHistory.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" }
          },
          redemptions: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const redemptionTrendsFormatted = redemptionTrends.map(item => ({
      month: monthNames[item._id.month - 1],
      redemptions: item.redemptions
    }));

    // Top vouchers by usage count
    const topVouchers = await Voucher.aggregate([
      { $sort: { usageCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: "$title",
          value: "$usageCount"
        }
      }
    ]);

    // Category distribution
    const categoryDistribution = await Category.aggregate([
      {
        $lookup: {
          from: "vouchers",
          localField: "_id",
          foreignField: "category_id",
          as: "vouchers"
        }
      },
      {
        $project: {
          name: "$name",
          value: { $size: "$vouchers" }
        }
      },
      { $sort: { value: -1 } }
    ]);

    // Real-time metrics
    const totalRedemptions = await CartItemHistory.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ status: "active" });
    const avgRedemptionsPerUser = totalUsers > 0 ? Math.round(totalRedemptions / totalUsers) : 0;

    const realtimeMetrics = [
      { label: "Total Redemptions", value: totalRedemptions.toString(), unit: "", percent: Math.min(totalRedemptions / 10, 100), tone: "primary" },
      { label: "Active Vouchers", value: activeVouchers.toString(), unit: "", percent: Math.min(activeVouchers * 2, 100), tone: "success" },
      { label: "Avg per User", value: avgRedemptionsPerUser.toString(), unit: "", percent: Math.min(avgRedemptionsPerUser * 5, 100), tone: "warning" },
    ];

    // Analytics KPIs
    const totalPointsRedeemedAgg = await CartItemHistory.aggregate([
      { $group: { _id: null, total: { $sum: "$pointsUsed" } } }
    ]);
    const totalPointsRedeemed = totalPointsRedeemedAgg[0]?.total || 0;

    const analyticsKPIs = [
      { label: "Total Redemptions", value: totalRedemptions.toLocaleString(), delta: "+14.2%", trend: "up" },
      { label: "Active Users", value: totalUsers.toLocaleString(), delta: "+8.2%", trend: "up" },
      { label: "Avg Discount", value: "23.5%", delta: "-1.4%", trend: "down" },
      { label: "Net Savings", value: `$${(totalPointsRedeemed * 0.1).toLocaleString()}`, delta: "+19.6%", trend: "up" },
    ];

    res.json({
      kpis: analyticsKPIs,
      redemptionTrends: redemptionTrendsFormatted,
      topVouchers,
      categoryDistribution: categoryDistribution.filter(c => c.value > 0),
      realtimeMetrics,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ is_active: true });
    const totalOrders = await CartItemHistory.countDocuments();
    const totalVouchers = await Voucher.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ status: "active" });

    // Sum all points used in orders from CartItemHistory
    const pointsAgg = await CartItemHistory.aggregate([
      { $group: { _id: null, totalPoints: { $sum: "$pointsUsed" } } },
    ]);
    const totalPointsRedeemed = pointsAgg[0]?.totalPoints || 0;

    const recentActivity = await CartItemHistory.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "username fullName")
      .populate("voucher", "title");

    // Get recent orders (last 5 completed orders)
    const recentOrdersList = await CartItemHistory.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username fullName")
      .populate("voucher", "title points");

    res.json({
      kpis: {
        totalUsers,
        activeUsers,
        totalOrders,
        totalVouchers,
        activeVouchers,
        totalPointsRedeemed,
      },
      recentActivity: recentActivity.map((order) => ({
        id: order._id,
        user: order.user?.fullName || order.user?.username || "Unknown",
        voucher: order.voucher?.title || "Unknown Voucher",
        points: order.pointsUsed || 0,
        time: new Date(order.createdAt).toLocaleString(),
        status: "completed",
      })),
      recentOrders: recentOrdersList.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        user: order.user?.fullName || order.user?.username || "Unknown",
        voucher: order.voucher?.title || "Unknown Voucher",
        points: order.pointsUsed || 0,
        time: new Date(order.createdAt).toLocaleString(),
        receiptUrl: order.receiptUrl,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
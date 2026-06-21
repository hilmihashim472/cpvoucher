const router = require("express").Router();
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin"); // Import the new middleware
const voucherController = require("../controllers/voucherController");
const categoryController = require("../controllers/categoryController");
const Category = require("../models/Category");
const User = require("../models/User");
const authController = require("../controllers/authController");
const CartItem = require('../models/CartItem');
const CartItemHistory = require('../models/CartItemHistory');
const Voucher = require('../models/Voucher');

// --- PROTECT ALL ROUTES BELOW THIS LINE ---
router.use(auth, adminOnly);

// ==========================================
// VOUCHER MANAGEMENT
// ==========================================
// Voucher routes
router.get('/vouchers', voucherController.getVouchersAdmin);
router.post('/vouchers', voucherController.createVoucher);
router.put('/vouchers/:id', voucherController.updateVoucher);
router.patch('/vouchers/:id', voucherController.updateVoucher);
router.delete('/vouchers/:id', voucherController.deleteVoucher);

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================
router.post("/categories", categoryController.createCategory);
router.get("/categories", categoryController.getCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.patch("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// ==========================================
// USER MANAGEMENT (Admin Specific)
// ==========================================

// Replace your existing GET /users route with this:
router.get("/users", async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    // Search & Filter
    const search = req.query.search || "";
    const roleFilter = req.query.role || "";

    // Build query
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

    // Execute query
    const users = await User.find(query)
      .select("-password")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
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

// Update a user
router.patch('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ message: "You cannot modify your own account here." });
    }

    const { role, is_active, fullName, email, points } = req.body;
    const updateData = {};

    if (role && ['user', 'admin'].includes(role)) updateData.role = role;
    if (typeof is_active === 'boolean') updateData.is_active = is_active;
    if (typeof fullName === 'string') updateData.fullName = fullName.trim();
    if (typeof points === 'number') updateData.points = points;

    if (email) {
      const nextEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: nextEmail, _id: { $ne: req.params.id } });
      if (existingUser) return res.status(409).json({ message: "Email is already in use" });
      updateData.email = nextEmail;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single user (for the "View" feature later)
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new user (Admin only)
router.post("/users", authController.adminCreateUser);

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ is_active: true });
    
    // Order stats
    const totalOrders = await CartItemHistory.countDocuments();
    const pendingOrders = await CartItem.countDocuments();
    
    // Voucher stats
    const totalVouchers = await Voucher.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ is_active: true });
    
    // Points statistics
    const userPointsAgg = await User.aggregate([
      { $group: { _id: null, totalPoints: { $sum: "$points" } } }
    ]);
    const totalPointsRedeemed = userPointsAgg[0]?.totalPoints || 0;
    
    // Recent activity (last 10 orders)
    const recentActivity = await CartItemHistory.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username fullName')
      .populate('voucher', 'name');
    
    // Pending orders (last 5)
    const pendingOrdersList = await CartItem.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username fullName')
      .populate('voucher', 'name points');
    
    res.json({
      kpis: {
        totalUsers,
        activeUsers,
        totalOrders,
        pendingOrders,
        totalVouchers,
        activeVouchers,
        totalPointsRedeemed
      },
      recentActivity: recentActivity.map(order => ({
        id: order._id,
        user: order.user?.fullName || order.user?.username || 'Unknown',
        voucher: order.voucher?.name || 'Unknown Voucher',
        points: order.points || 0,
        time: new Date(order.createdAt).toLocaleString(),
        status: 'completed'
      })),
      pendingOrders: pendingOrdersList.map(order => ({
        id: order._id,
        user: order.user?.fullName || order.user?.username || 'Unknown',
        voucher: order.voucher?.name || 'Unknown Voucher',
        points: order.voucher?.points || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

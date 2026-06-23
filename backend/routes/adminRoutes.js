const router = require("express").Router();
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");
const voucherController = require("../controllers/voucherController");
const orderHistoryController = require("../controllers/OrderHistoryController");
const DashboardController = require("../controllers/DashboardController");
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
router.get("/users", authController.getUsers);
router.get("/users/:id", authController.getUserById);
router.post("/users", authController.adminCreateUser);
router.patch("/users/:id", authController.updateUser);
router.delete("/users/:id", authController.deleteUser);

// ==========================================
// ORDER MANAGEMENT
// ==========================================
router.get("/orders", orderHistoryController.getAdminOrders);

// ==========================================
// DASHBOARD STATISTICS
// ==========================================
// ==========================================
// ANALYTICS & REPORTS
// ==========================================
router.get("/analytics", DashboardController.getAnalytics);
router.get("/stats", DashboardController.getStats);

module.exports = router;
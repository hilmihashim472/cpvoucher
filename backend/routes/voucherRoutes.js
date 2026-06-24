const router = require("express").Router();
const voucherController = require("../controllers/voucherController");
const auth = require("../middleware/auth");

// Public routes (for users)
router.get("/", voucherController.getVouchersForUsers);
router.get("/category-counts", voucherController.getCategoryCounts);
router.get("/:id", voucherController.getVoucherById);

module.exports = router;
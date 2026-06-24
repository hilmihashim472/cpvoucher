const router = require("express").Router();
const auth = require("../middleware/auth");
const { getOrderHistory } = require("../controllers/OrderHistoryController");

router.get("/history", auth, getOrderHistory);

module.exports = router;
const router = require('express').Router();
const auth = require('../middleware/auth');
const voucherController = require('../controllers/voucherController');
const Category = require('../models/Category');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

router.post('/vouchers', auth, adminOnly, voucherController.createVoucher);
router.put('/vouchers/:id', auth, adminOnly, voucherController.updateVoucher);

router.post('/categories', auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/categories', auth, adminOnly, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

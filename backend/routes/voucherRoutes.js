//routes/voucherRoutes.js

const router = require('express').Router();
const c = require('../controllers/voucherController');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

router.post('/', auth, adminOnly, c.createVoucher);
router.get('/', c.getVouchers);
router.get('/:id', c.getVoucherById);
router.put('/:id', auth, adminOnly, c.updateVoucher);
router.delete('/:id', auth, adminOnly, c.deleteVoucher);

module.exports = router;

const router = require('express').Router();
const auth = require('../middleware/auth');
const cartController = require('../controllers/cartController');

router.get('/', auth, cartController.getCartItems);
router.post('/', auth, cartController.addToCart);
router.get('/history', auth, cartController.getOrderHistory);
router.post('/redeem', auth, cartController.redeemVouchers);
router.put('/:id', auth, cartController.updateCartItem);
router.delete('/:id', auth, cartController.removeCartItem);

module.exports = router;
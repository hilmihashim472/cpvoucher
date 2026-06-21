const router = require('express').Router();
const auth = require('../controllers/authController');

router.post('/register', auth.signup);
router.post('/login', auth.login);
router.get('/me', require('../middleware/auth'), auth.getMe);
router.put('/me', require('../middleware/auth'), auth.updateMe);

module.exports = router;

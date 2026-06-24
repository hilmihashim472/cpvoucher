const router = require("express").Router();
const auth = require("../controllers/authController");

router.post("/register", auth.signup);
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.get("/me", require("../middleware/auth"), auth.getMe);
router.put("/me", require("../middleware/auth"), auth.updateMe);
router.delete("/profile-picture", require("../middleware/auth"), auth.removeProfilePicture);

module.exports = router;
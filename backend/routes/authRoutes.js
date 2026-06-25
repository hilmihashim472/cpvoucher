const router = require("express").Router();
const passport = require("passport");
const auth = require("../controllers/authController");

router.post("/register", auth.signup);
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.get("/me", require("../middleware/auth"), auth.getMe);
router.put("/me", require("../middleware/auth"), auth.updateMe);
router.delete("/profile-picture", require("../middleware/auth"), auth.removeProfilePicture);

router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=google_auth_failed` }),
  auth.googleCallback
);

module.exports = router;

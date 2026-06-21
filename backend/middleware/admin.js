module.exports = (req, res, next) => {
  // req.user is populated by your auth.js middleware
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
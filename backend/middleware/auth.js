const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  // 'Bearer <token>'
  if (!header) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.userId = user._id;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

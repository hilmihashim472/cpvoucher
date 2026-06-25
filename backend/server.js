// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const adminRoutes = require('./routes/adminRoutes');
const orderHistoryRoutes = require("./routes/orderHistoryRoutes");

const passport = require("./config/passport");

const app = express();

// ─────────────────────────────────────────────
// 1. Connect to Database
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// 2. Create Uploads Directory on Startup
// ─────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
const profilesDir = path.join(uploadsDir, "profiles");

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
  console.log("✅ Created uploads/profiles directory");
}

// ─────────────────────────────────────────────
// 3. Middleware
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" })); // For form submissions

// ─────────────────────────────────────────────
// 4. Serve Static Files (Uploaded Images)
// ─────────────────────────────────────────────
app.use("/uploads", express.static(uploadsDir));

// ─────────────────────────────────────────────
// 5. API Routes
// ─────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vouchers", require("./routes/voucherRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", orderHistoryRoutes);
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/admin", adminRoutes);
app.use("/api/upload", require("./routes/uploadRoutes")); 
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────────────────────
// 6. Health Check Endpoint
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ─────────────────────────────────────────────
// 7. 404 Handler (Undefined Routes)
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found` 
  });
});

// ─────────────────────────────────────────────
// 8. Global Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  
  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ 
      message: "File too large. Maximum size is 1MB" 
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ─────────────────────────────────────────────
// 9. Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 API running on port https://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// ─────────────────────────────────────────────
// 10. Graceful Shutdown
// ─────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
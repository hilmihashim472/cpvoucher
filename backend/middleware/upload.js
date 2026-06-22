const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base uploads directory
const baseUploadDir = path.join(__dirname, "..", "uploads");

// Helper: Ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Factory function: Create upload middleware for a specific folder
const createUpload = (subfolder, maxSizeMB = 1, filenamePrefix = "file") => {
  const uploadDir = path.join(baseUploadDir, subfolder);
  ensureDir(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const userId = req.user?.id || "anon";
      const uniqueSuffix = `${userId}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${filenamePrefix}-${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
  };

  return multer({
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter,
  });
};

// Pre-configured upload instances
const profileUpload = createUpload("profiles", 1, "profile");    // 1MB limit
const voucherUpload = createUpload("vouchers", 2, "voucher");    // 2MB limit

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size too large" });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = {
  profileUpload,
  voucherUpload,
  handleUploadError,
  createUpload, // Export factory for future custom uploads
};
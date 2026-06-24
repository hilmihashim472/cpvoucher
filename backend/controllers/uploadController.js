const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

// ==========================================
// PROFILE PICTURE UPLOAD
// ==========================================
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const originalPath = req.file.path;
    const processedFilename = `${userId}-${Date.now()}-processed.jpg`;
    const processedPath = path.join(
      __dirname,
      "..",
      "uploads",
      "profiles",
      processedFilename
    );

    // Process image: resize to 400x400, convert to JPEG, compress
    await sharp(originalPath)
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(processedPath);

    // Delete original file
    fs.unlinkSync(originalPath);

    // Delete old profile picture if exists
    const user = await User.findById(userId);
    if (user.profile_picture) {
      const oldPicturePath = path.join(
        __dirname,
        "..",
        "uploads",
        "profiles",
        path.basename(user.profile_picture)
      );
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update user with new profile picture URL
    const profilePictureUrl = `/uploads/profiles/${processedFilename}`;
    await User.findByIdAndUpdate(userId, {
      profile_picture: profilePictureUrl,
    });

    res.json({
      message: "Profile picture uploaded successfully",
      url: profilePictureUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    
    // Clean up file if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
};

// ==========================================
// VOUCHER IMAGE UPLOAD
// ==========================================
const uploadVoucherImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const originalPath = req.file.path;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const processedFilename = `voucher-${uniqueSuffix}.jpg`;
    const processedPath = path.join(
      __dirname,
      "..",
      "uploads",
      "vouchers",
      processedFilename
    );

    // Ensure vouchers directory exists
    const vouchersDir = path.join(__dirname, "..", "uploads", "vouchers");
    if (!fs.existsSync(vouchersDir)) {
      fs.mkdirSync(vouchersDir, { recursive: true });
    }

    // Process image: resize to 800x600 (landscape), convert to JPEG, compress
    await sharp(originalPath)
      .resize(800, 600, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 85 })
      .toFile(processedPath);

    // Delete original file
    fs.unlinkSync(originalPath);

    // Return the URL path
    const imageUrl = `/uploads/vouchers/${processedFilename}`;

    res.json({
      message: "Voucher image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Voucher upload error:", error);
    
    // Clean up file if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: "Failed to upload voucher image" });
  }
};

module.exports = { uploadProfilePicture, uploadVoucherImage };
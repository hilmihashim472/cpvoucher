const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

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

module.exports = { uploadProfilePicture };
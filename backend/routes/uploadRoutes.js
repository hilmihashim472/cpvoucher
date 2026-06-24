const express = require("express");
const { uploadProfilePicture } = require("../controllers/uploadController");
const { profileUpload, handleUploadError } = require("../middleware/upload");
const authenticate = require("../middleware/auth");

const router = express.Router();

// POST /api/upload/profile-picture
router.post(
  "/profile-picture",
  authenticate,
  profileUpload.single("profilePicture"),
  handleUploadError,
  uploadProfilePicture
);

module.exports = router;
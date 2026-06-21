const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

exports.signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, password: hash });
    res.status(201).json({ id: user._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const ok = user && (await bcrypt.compare(req.body.password, user.password));
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh access token using httpOnly cookie
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const stored = await RefreshToken.findOne({ token });
    if (!stored || stored.expires < Date.now()) {
      await RefreshToken.deleteOne({ _id: stored?._id });
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(stored.user);
    if (!user) return res.status(401).json({ message: "User not found" });

    const accessToken = generateAccessToken(user._id);
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout — invalidate refresh token
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await RefreshToken.deleteOne({ token });
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const {
      username,
      fullName,
      email,
      profile_picture,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const nextEmail = email?.trim().toLowerCase();
    if (nextEmail && nextEmail !== user.email) {
      const existingUser = await User.findOne({
        email: nextEmail,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(409).json({ message: "Email is already in use" });
      }
      user.email = nextEmail;
    }

    if (typeof username === "string") {
      const nextUsername = username.trim();
      if (!nextUsername) {
        return res.status(400).json({ message: "Username is required" });
      }
      user.username = nextUsername;
    }

    if (typeof fullName === "string") {
      user.fullName = fullName.trim();
    }

    if (typeof profile_picture === "string" || profile_picture === null) {
      user.profile_picture = profile_picture;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ message: "New password must be at least 8 characters" });
      }

      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!passwordMatches) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete file from uploads folder if it exists
    if (user.profile_picture) {
      const fileName = path.basename(user.profile_picture);
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "profiles",
        fileName,
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Update user document to remove profile picture
    user.profile_picture = null;
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json({
      message: "Profile picture removed successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin creates a new user
exports.adminCreateUser = async (req, res) => {
  try {
    const { email, username, fullName, password, role, points, is_active } = req.body;
    
    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email is already in use" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      fullName,
      password: hash,
      role: role || 'user',
      points: points || 1000,
      is_active: is_active !== undefined ? is_active : true
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
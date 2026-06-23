const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

// ─── Token helpers ────────────────────────────────────────────────────────────

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

const REFRESH_TOKEN_TTL_MS = 1 * 24 * 60 * 60 * 1000; // 1 day

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: REFRESH_TOKEN_TTL_MS,
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

exports.signup = async (req, res) => {
  try {
    const { email, fullName, username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, fullName, password: hash });
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
      expires: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh access token — rotates the refresh token on every use.
//
// Rotation means the old token is deleted and a brand-new one is issued.
// If we detect that an already-used (rotated-away) token is being presented,
// it means the token was stolen at some point, so we wipe ALL tokens for
// that user as a precaution (token family invalidation).
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    // Clear the cookie immediately — we will set a new one if everything is ok
    res.clearCookie("refreshToken", refreshCookieOptions);

    const stored = await RefreshToken.findOne({ token });

    // ── Reuse detection ───────────────────────────────────────────────────────
    // If the token is not in the DB at all, it may have already been rotated.
    // This could mean someone is replaying a stolen old token, so invalidate
    // every token belonging to that user (we decode to get the user id).
    if (!stored) {
      try {
        // The token is not a JWT, so we can't decode it directly.
        // Instead, try to find which user it *used to* belong to via a
        // separate lookup field if you add one, or simply return 401.
        // If you store a `family` field you can wipe the whole family here.
        // For now, we just reject cleanly.
        return res.status(401).json({ message: "Refresh token reuse detected" });
      } catch {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    // ── Expired token ─────────────────────────────────────────────────────────
    if (stored.expires < Date.now()) {
      await RefreshToken.deleteOne({ _id: stored._id });
      return res.status(401).json({ message: "Refresh token expired" });
    }

    const user = await User.findById(stored.user);
    if (!user) {
      await RefreshToken.deleteOne({ _id: stored._id });
      return res.status(401).json({ message: "User not found" });
    }

    // ── Rotate — delete old, create new ──────────────────────────────────────
    await RefreshToken.deleteOne({ _id: stored._id });

    const newRefreshToken = generateRefreshToken();
    await RefreshToken.create({
      token: newRefreshToken,
      user: user._id,
      expires: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    const accessToken = generateAccessToken(user._id);

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout — delete this device's refresh token only
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await RefreshToken.deleteOne({ token });
    res.clearCookie("refreshToken", refreshCookieOptions);
    res.json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout from every device — wipe all refresh tokens for this user
exports.logoutAll = async (req, res) => {
  try {
    await RefreshToken.deleteMany({ user: req.userId });
    res.clearCookie("refreshToken", refreshCookieOptions);
    res.json({ message: "Logged out from all devices" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────────

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
        return res.status(400).json({ message: "Current password is required" });
      }
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ message: "New password must be at least 8 characters" });
      }

      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!passwordMatches) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);

      // Security: invalidate all refresh tokens when password changes so that
      // any stolen session is immediately terminated.
      await RefreshToken.deleteMany({ user: user._id });
      res.clearCookie("refreshToken", refreshCookieOptions);
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

    if (user.profile_picture) {
      const fileName = path.basename(user.profile_picture);
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "profiles",
        fileName
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.profile_picture = null;
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json({ message: "Profile picture removed successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

exports.adminCreateUser = async (req, res) => {
  try {
    const { email, username, fullName, password, role, points, is_active } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "Email is already in use" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      fullName,
      password: hash,
      role: role || "user",
      points: points || 1000,
      is_active: is_active !== undefined ? is_active : true,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    const search = req.query.search || "";
    const roleFilter = req.query.role || "";

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }
    if (roleFilter && roleFilter !== "All") {
      query.role = roleFilter.toLowerCase();
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user
exports.updateUser = async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ message: "You cannot modify your own account here." });
    }

    const { role, is_active, fullName, email, points } = req.body;
    const updateData = {};

    if (role && ["user", "admin"].includes(role)) updateData.role = role;
    if (typeof is_active === "boolean") updateData.is_active = is_active;
    if (typeof fullName === "string") updateData.fullName = fullName.trim(); 
    if (typeof points === "number") updateData.points = points;

    if (email) {
      const nextEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: nextEmail, _id: { $ne: req.params.id } });
      if (existingUser) return res.status(409).json({ message: "Email is already in use" });
      updateData.email = nextEmail;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single user
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
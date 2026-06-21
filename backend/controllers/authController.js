const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
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
      const existingUser = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
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
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      const passwordMatches = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Current password is incorrect" });
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

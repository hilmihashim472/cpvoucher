const Voucher = require("../models/Voucher");
const Category = require("../models/Category");
const path = require("path");
const fs = require("fs");
const { generateVoucherDescription } = require("../services/gemini");

// Helper: generate a unique voucher code from title, brand, category
async function generateUniqueCode({ title, brand, categoryName }) {
  const slugify = (str) =>
    str
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 20);

  const base = [slugify(brand), slugify(categoryName), slugify(title)]
    .filter(Boolean)
    .join("-")
    .slice(0, 40);

  let code = base;
  let counter = 1;
  const maxAttempts = 10;

  while (counter < maxAttempts) {
    const existing = await Voucher.findOne({ code });
    if (!existing) break;
    code = `${base}-${counter}`;
    counter += 1;
  }

  if (counter >= maxAttempts) {
    code = `${base}-${Date.now().toString(36).toUpperCase()}`;
  }

  return code;
}

// ==========================================
// CREATE VOUCHER
// ==========================================
exports.createVoucher = async (req, res) => {
  try {
    let {
      title,
      brand,
      category_id,
      description,
      points,
      code,
      expiresAt,
      quantity,
      status,
      discountAmount,
      storeName,
      tagline,
      brandUrl,
      image,
    } = req.body;

    // Validate required fields
    if (!title || !brand || !category_id || !points || !expiresAt || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Auto-generate unique code from title, brand, category if not provided
    if (!code) {
      const category = await Category.findById(category_id);
      const categoryName = category ? category.name : "";
      code = await generateUniqueCode({ title, brand, categoryName });
    }

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Validate expiry date
    if (new Date(expiresAt) <= new Date()) {
      return res.status(400).json({ message: "Expiry date must be in the future" });
    }

    // Check if code is unique
    const existingCode = await Voucher.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(409).json({ message: "Voucher code already exists" });
    }

    // Check if category exists
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const voucher = await Voucher.create({
      title,
      brand,
      category_id,
      description,
      points: Number(points),
      code: code.toUpperCase(),
      expiresAt: new Date(expiresAt),
      quantity: Number(quantity),
      status: status || "draft",
      discountAmount: discountAmount ? Number(discountAmount) : 0,
      storeName,
      tagline,
      brandUrl,
      image,
    });

    const populated = await Voucher.findById(voucher._id).populate(
      "category_id",
      "name slug icon color status"
    );

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create voucher error:", err);
    res.status(400).json({ message: err.message });
  }
};

// ==========================================
// GET ALL VOUCHERS (ADMIN)
// ==========================================
exports.getVouchersAdmin = async (req, res) => {
  try {
    const {
      category,
      search,
      sort = "newest",
      page = 1,
      limit = 10,
      status,
    } = req.query;

    let filter = {};

    // Category filter
    if (category && category !== "All") {
      filter.category_id = category;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Status filtering
    const now = new Date();
    if (status && status !== "All") {
      if (status === "draft") {
        filter.status = "draft";
      } else if (status === "active") {
        filter.status = "active";
        filter.expiresAt = { $gte: now };
        filter.$expr = { $lt: ["$usageCount", "$quantity"] };
      } else if (status === "expired") {
        filter.expiresAt = { $lt: now };
      } else if (status === "fully-claimed") {
        filter.status = "active";
        filter.$expr = { $gte: ["$usageCount", "$quantity"] };
      }
    }

    // Sort
    let sortObj = {};
    switch (sort) {
      case "points-asc":
        sortObj = { points: 1 };
        break;
      case "points-desc":
        sortObj = { points: -1 };
        break;
      case "popular":
        sortObj = { usageCount: -1 };
        break;
      case "title-asc":
        sortObj = { title: 1 };
        break;
      case "title-desc":
        sortObj = { title: -1 };
        break;
      case "expiresAt-asc":
        sortObj = { expiresAt: 1 };
        break;
      case "expiresAt-desc":
        sortObj = { expiresAt: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Voucher.countDocuments(filter);
    const vouchers = await Voucher.find(filter)
      .populate("category_id", "name slug icon color status")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      vouchers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Error in getVouchersAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// GET SINGLE VOUCHER (ADMIN)
// ==========================================
exports.getVoucherByIdAdmin = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate(
      "category_id",
      "name slug icon color status"
    );

    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    res.status(200).json(voucher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// UPDATE VOUCHER
// ==========================================
exports.updateVoucher = async (req, res) => {
  try {
    const {
      title,
      brand,
      category_id,
      description,
      points,
      code,
      expiresAt,
      quantity,
      status,
      discountAmount,
      storeName,
      tagline,
      brandUrl,
      image,
    } = req.body;

    // Validate quantity
    if (quantity !== undefined && quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Validate expiry date
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res.status(400).json({ message: "Expiry date must be in the future" });
    }

    // Check if code is unique (excluding current voucher)
    if (code) {
      const existingCode = await Voucher.findOne({
        code: code.toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (existingCode) {
        return res.status(409).json({ message: "Voucher code already exists" });
      }
    }

    // Check if category exists
    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (brand !== undefined) updateData.brand = brand;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (description !== undefined) updateData.description = description;
    if (points !== undefined) updateData.points = Number(points);
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (status !== undefined) updateData.status = status;
    if (discountAmount !== undefined)
      updateData.discountAmount = Number(discountAmount);
    if (storeName !== undefined) updateData.storeName = storeName;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (brandUrl !== undefined) updateData.brandUrl = brandUrl;
    if (image !== undefined) updateData.image = image;

    const voucher = await Voucher.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("category_id", "name slug icon color status");

    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    res.status(200).json(voucher);
  } catch (err) {
    console.error("Update voucher error:", err);
    res.status(400).json({ message: err.message });
  }
};

// ==========================================
// DELETE VOUCHER
// ==========================================
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    // Check if voucher has been used
    if (voucher.usageCount > 0) {
      return res.status(400).json({
        message: `Cannot delete voucher. It has been used ${voucher.usageCount} time(s).`,
      });
    }

    // Delete image file if exists and is uploaded
    if (voucher.image && voucher.image.startsWith("/uploads/")) {
      const filePath = path.join(
        __dirname,
        "..",
        voucher.image.replace("/uploads/", "uploads/")
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: "Voucher deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// AI GENERATE DESCRIPTION (GEMINI)
// ==========================================
exports.generateDescription = async (req, res) => {
  try {
    const { title, brand, category, points, discountAmount } = req.body;

    if (!title || !brand) {
      return res.status(400).json({ message: "Title and brand are required" });
    }

    const description = await generateVoucherDescription({
      title,
      brand,
      category,
      points,
      discountAmount,
    });

    res.status(200).json({ description });
  } catch (err) {
    console.error("Generate description error:", err);
    res.status(500).json({ message: err.message || "Failed to generate description" });
  }
};

// ==========================================
// GET VOUCHERS FOR USERS (PUBLIC)
// ==========================================
exports.getVouchersForUsers = async (req, res) => {
  try {
    const { category, search, sort = "newest", page = 1, limit = 9 } = req.query;

    const now = new Date();

    // Base filter: active, not expired, not fully claimed
    let filter = {
      status: "active",
      expiresAt: { $gte: now },
      $expr: { $lt: ["$usageCount", "$quantity"] },
    };

    // Get active categories only
    const activeCategories = await Category.find({ status: "active" }).select(
      "_id slug"
    );
    const activeCategoryIds = activeCategories.map((c) => c._id);

    filter.category_id = { $in: activeCategoryIds };

    if (category) {
      const categoryDoc = await Category.findOne({
        slug: category,
        status: "active",
      });
      if (categoryDoc) {
        filter.category_id = categoryDoc._id;
      } else {
        return res.status(200).json({
          vouchers: [],
          pagination: { page: 1, limit: 9, total: 0, totalPages: 0 },
        });
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortObj = {};
    switch (sort) {
      case "points-asc":
        sortObj = { points: 1 };
        break;
      case "points-desc":
        sortObj = { points: -1 };
        break;
      case "popular":
        sortObj = { usageCount: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 9);
    const skip = (pageNum - 1) * limitNum;

    const total = await Voucher.countDocuments(filter);
    const vouchers = await Voucher.find(filter)
      .populate("category_id", "name slug icon color")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      vouchers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Error in getVouchersForUsers:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// GET SINGLE VOUCHER (USER)
// ==========================================
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate(
      "category_id",
      "name slug icon color status"
    );

    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    // Check if voucher is available for users
    const now = new Date();
    if (
      voucher.status !== "active" ||
      voucher.expiresAt < now ||
      voucher.usageCount >= voucher.quantity
    ) {
      return res.status(403).json({ message: "This voucher is not available" });
    }

    res.status(200).json(voucher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// CATEGORY COUNTS (FOR PUBLIC SIDEBAR)
// ==========================================
exports.getCategoryCounts = async (req, res) => {
  try {
    const now = new Date();

    const activeCategories = await Category.find({ status: "active" }).select(
      "_id name slug"
    );
    const activeCategoryIds = activeCategories.map((c) => c._id);

    const counts = await Voucher.aggregate([
      {
        $match: {
          category_id: { $in: activeCategoryIds },
          status: "active",
          expiresAt: { $gte: now },
          $expr: { $lt: ["$usageCount", "$quantity"] },
        },
      },
      { $group: { _id: "$category_id", count: { $sum: 1 } } },
    ]);

    const categoryMap = {};
    activeCategories.forEach((cat) => {
      categoryMap[cat._id.toString()] = cat.slug;
    });

    const result = {};
    let total = 0;

    // Initialize all active categories with 0 count (keyed by slug)
    activeCategories.forEach((cat) => {
      result[cat.slug] = 0;
    });

    // Fill in actual counts
    counts.forEach(({ _id, count }) => {
      if (_id) {
        const slug = categoryMap[_id.toString()];
        if (slug) {
          result[slug] = count;
          total += count;
        }
      }
    });

    result["All Deals"] = total;

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getCategoryCounts:", err);
    res.status(500).json({ message: err.message });
  }
};
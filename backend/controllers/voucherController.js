const Voucher = require("../models/Voucher");
const Category = require("../models/Category");

// Create a new voucher
exports.createVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json(voucher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// FOR ADMIN: Get all vouchers (no filtering by category status)
// This is used in /admin/vouchers
// ─────────────────────────────────────────────
exports.getVouchersAdmin = async (req, res) => {
  try {
    const { category, search, sort = "newest", page = 1, limit = 10 } = req.query;
    let filter = {};
    
    if (category && category !== "All") {
      filter.category_id = category; // category is now the ID from the select dropdown
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case "points-asc": sortObj = { points: 1 }; break;
      case "points-desc": sortObj = { points: -1 }; break;
      case "popular": sortObj = { usageCount: -1 }; break;
      case "newest":
      default: sortObj = { createdAt: -1 }; break;
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

// ─────────────────────────────────────────────
// FOR USERS: Get vouchers (ONLY from active categories)
// This is used in /vouchers (public facing)
// ─────────────────────────────────────────────
exports.getVouchersForUsers = async (req, res) => {
  try {
    const { category, search, sort = "newest", page = 1, limit = 9 } = req.query;
    
    // First, find all ACTIVE categories
    const activeCategories = await Category.find({ status: "active" }).select("_id slug");
    const activeCategoryIds = activeCategories.map(c => c._id);

    let filter = { 
      category_id: { $in: activeCategoryIds } // ONLY vouchers from active categories
    };
    
    if (category) {
      // Filter by specific category (must also be active)
      const categoryDoc = await Category.findOne({ slug: category, status: "active" });
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

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case "points-asc": sortObj = { points: 1 }; break;
      case "points-desc": sortObj = { points: -1 }; break;
      case "popular": sortObj = { usageCount: -1 }; break;
      case "newest":
      default: sortObj = { createdAt: -1 }; break;
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

// ─────────────────────────────────────────────
// Get single voucher by ID
// ─────────────────────────────────────────────
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate("category_id", "name slug icon color status");
    
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });
    
    // If category is draft, only admins should see it
    // (Check if user is admin via req.user.role if you have auth middleware)
    if (voucher.category_id && voucher.category_id.status === "draft") {
      // For now, allow all. Later you can restrict:
      // if (!req.user || req.user.role !== "admin") {
      //   return res.status(403).json({ message: "This voucher is not available" });
      // }
    }
    
    res.status(200).json(voucher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a voucher
exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(voucher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a voucher
exports.deleteVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: "Voucher deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// Category counts - ONLY count vouchers in active categories
// Used for public-facing category sidebar
// ─────────────────────────────────────────────
exports.getCategoryCounts = async (req, res) => {
  try {
    // Only count vouchers from ACTIVE categories
    const activeCategories = await Category.find({ status: "active" }).select("_id name");
    const activeCategoryIds = activeCategories.map(c => c._id);

    // Aggregate vouchers grouped by category_id (only active categories)
    const counts = await Voucher.aggregate([
      { $match: { category_id: { $in: activeCategoryIds } } },
      { $group: { _id: "$category_id", count: { $sum: 1 } } }
    ]);

    // Build the final response
    const categoryMap = {};
    activeCategories.forEach((cat) => {
      categoryMap[cat._id.toString()] = cat.name;
    });

    const result = {};
    let total = 0;

    counts.forEach(({ _id, count }) => {
      if (_id) {
        const name = categoryMap[_id.toString()];
        if (name) {
          result[name] = count;
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
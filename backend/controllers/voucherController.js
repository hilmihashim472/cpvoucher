const Voucher = require("../models/Voucher");

// Create a new voucher
exports.createVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json(voucher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Read vouchers (with optional category, search, sort, and page filters)
exports.getVouchers = async (req, res) => {
  try {
    const { category, search, sort = "newest", page = 1, limit = 9 } = req.query;
    let filter = {};
    
    if (category) {
      // If category is provided, find the category first and filter by its ID
      const Category = require("../models/Category");
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        filter = { category_id: categoryDoc._id };
      } else {
        filter = { _id: null };
      }
    }
    
    let list = await Voucher.find(filter).populate("category_id");
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      list = list.filter(v => 
        (v.title || "").toLowerCase().includes(searchLower) ||
        (v.brand || "").toLowerCase().includes(searchLower) ||
        (v.description || "").toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    switch (sort) {
      case "points-asc":
        list.sort((a, b) => a.points - b.points);
        break;
      case "points-desc":
        list.sort((a, b) => b.points - a.points);
        break;
      case "popular":
        list.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        break;
      case "newest":
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    // Apply pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 9);
    const total = list.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const paginatedList = list.slice(start, start + limitNum);
    
    res.status(200).json({
      vouchers: paginatedList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Error in getVouchers:", err);
    res.status(500).json({ message: err.message });
  }
};

// Read one voucher by ID
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate("category_id");
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });
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

exports.getCategoryCounts = async (req, res) => {
  try {
    const Category = require("../models/Category");

    // Aggregate vouchers grouped by category_id
    const counts = await Voucher.aggregate([
      { $group: { _id: "$category_id", count: { $sum: 1 } } }
    ]);

    // Fetch all category documents so we can map _id → name
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat._id.toString()] = cat.name;
    });

    // Build the final response { Food: 91, Tech: 60, "All Deals": 312 }
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

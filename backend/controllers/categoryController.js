const Category = require("../models/Category");
const Voucher = require("../models/Voucher");
const { generateCategoryDescription } = require("../services/gemini");

// Get all categories with voucher count, pagination, search, and filtering
exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const statusFilter = req.query.status || "";
    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (statusFilter && statusFilter !== "All") {
      query.status = statusFilter.toLowerCase();
    }

    // Get categories
    const categories = await Category.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Count vouchers for each category (only active, non-expired, available vouchers)
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const now = new Date();
        const voucherCount = await Voucher.countDocuments({
          category_id: cat._id,
          status: "active",
          expiresAt: { $gte: now },
          $expr: { $lt: ["$usageCount", "$quantity"] },
        });
        return { ...cat.toObject(), voucherCount };
      })
    );

    // Get total count
    const total = await Category.countDocuments(query);

    res.json({
      categories: categoriesWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single category
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, color, status } = req.body;

    // Check if name already exists
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) return res.status(409).json({ message: "Category name already exists" });

    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: description || "",
      icon: icon || "Tag",
      color: color || "#F97316",
      status: status || "draft",
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, color, status } = req.body;

    // Check if name already exists (excluding current category)
    if (name) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: req.params.id },
      });
      if (existing) return res.status(409).json({ message: "Category name already exists" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (status) updateData.status = status;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category has vouchers using the correct field name: category_id
    const voucherCount = await Voucher.countDocuments({ category_id: req.params.id });
    if (voucherCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${voucherCount} voucher(s) assigned to it.`,
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate category description using AI
exports.generateCategoryDescription = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const description = await generateCategoryDescription(name);

    res.status(200).json({ description });
  } catch (err) {
    console.error("Generate category description error:", err);
    res.status(500).json({ message: err.message || "Failed to generate description" });
  }
};

// Get only ACTIVE categories (for users)
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

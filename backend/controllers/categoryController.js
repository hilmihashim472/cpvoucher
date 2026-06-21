const Category = require("../models/Category");

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const CategoryModel = require("../models/categoryModel");


class CategoryController {
  static async getAll(req, res) {
    try {
      const categories = await CategoryModel.getAll();
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Server error while fetching categories." });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id);

      if (!category) {
        return res.status(404).json({ message: "Category not found." });
      }

      res.status(200).json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Server error while fetching category." });
    }
  }

  static async create(req, res) {
    try {
      const { name } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Category name is required." });
      }

      const newCategory = await CategoryModel.create({ name });
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);

      if (error.code === "23505") {
        return res.status(409).json({ message: "Category name already exists." });
      }

      res.status(500).json({ message: "Server error while creating category." });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const updatedCategory = await CategoryModel.updateById(id, { name });

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found." });
      }

      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Server error while updating category." });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deletedCategory = await CategoryModel.deleteById(id);

      if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found." });
      }

      res.status(200).json({ message: "Category deleted successfully.", deletedCategory });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Server error while deleting category." });
    }
  }
}

module.exports = CategoryController;

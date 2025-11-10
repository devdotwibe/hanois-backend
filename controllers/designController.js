const designModel = require("../models/designModel");

class designController {
  // 🟩 Get all designs
  static async getAll(req, res) {
    try {
      const designs = await designModel.getAll();
      res.status(200).json(designs);
    } catch (error) {
      console.error("Error fetching designs:", error);
      res.status(500).json({ message: "Server error while fetching designs." });
    }
  }

  // 🟩 Get design by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const design = await designModel.findById(id);

      if (!design) {
        return res.status(404).json({ message: "Design not found." });
      }

      res.status(200).json(design);
    } catch (error) {
      console.error("Error fetching design:", error);
      res.status(500).json({ message: "Server error while fetching design." });
    }
  }

  // 🟩 Create a new design
  static async create(req, res) {
    try {
      const { name } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Design name is required." });
      }

      const newDesign = await designModel.create({ name });
      res.status(201).json(newDesign);
    } catch (error) {
      console.error("Error creating design:", error);

      if (error.code === "23505") {
        return res.status(409).json({ message: "Design name already exists." });
      }

      res.status(500).json({ message: "Server error while creating design." });
    }
  }

  // 🟩 Update a design
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const updatedDesign = await designModel.updateById(id, { name });

      if (!updatedDesign) {
        return res.status(404).json({ message: "Design not found." });
      }

      res.status(200).json(updatedDesign);
    } catch (error) {
      console.error("Error updating design:", error);
      res.status(500).json({ message: "Server error while updating design." });
    }
  }

  // 🟩 Delete a design
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deletedDesign = await designModel.deleteById(id);

      if (!deletedDesign) {
        return res.status(404).json({ message: "Design not found." });
      }

      res.status(200).json({ message: "Design deleted successfully.", deletedDesign });
    } catch (error) {
      console.error("Error deleting design:", error);
      res.status(500).json({ message: "Server error while deleting design." });
    }
  }
}

module.exports = designController;

const serviceModel = require("../models/serviceModel");


class serviceController {
  static async getAll(req, res) {
    try {
      const services = await serviceModel.getAll();
      res.status(200).json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Server error while fetching services." });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const service = await serviceModel.findById(id);

      if (!service) {
        return res.status(404).json({ message: "service not found." });
      }

      res.status(200).json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Server error while fetching service." });
    }
  }

  static async create(req, res) {
    try {
      const { name } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "service name is required." });
      }

      const newservice = await serviceModel.create({ name });
      res.status(201).json(newservice);
    } catch (error) {
      console.error("Error creating service:", error);

      if (error.code === "23505") {
        return res.status(409).json({ message: "service name already exists." });
      }

      res.status(500).json({ message: "Server error while creating service." });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const updatedservice = await serviceModel.updateById(id, { name });

      if (!updatedservice) {
        return res.status(404).json({ message: "service not found." });
      }

      res.status(200).json(updatedservice);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Server error while updating service." });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deletedservice = await serviceModel.deleteById(id);

      if (!deletedservice) {
        return res.status(404).json({ message: "service not found." });
      }

      res.status(200).json({ message: "service deleted successfully.", deletedservice });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Server error while deleting service." });
    }
  }
}

module.exports = serviceController;

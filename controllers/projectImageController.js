const path = require("path");
const ProjectImageModel = require("../models/projectImageModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// 🟩 Create project image (after upload)
exports.createProjectImage = async (req, res, next) => {
  try {
    const { project_id, provider_id } = req.body;

    if (!project_id || !provider_id) {
      throw new ValidationError("project_id and provider_id are required");
    }

    const files = req.files || {};
    const imageFile = files.image?.[0];

    if (!imageFile) {
      throw new ValidationError("No image uploaded");
    }

    const image_path = `/uploads/projects/${imageFile.filename}`;

    const newImage = await ProjectImageModel.create({
      project_id,
      provider_id,
      image_path,
    });

    successResponse(res, { newImage }, "Project image added successfully", 201);
  } catch (err) {
    next(err);
  }
};

// 🟩 Get all images for a project
exports.getImagesByProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const images = await ProjectImageModel.getByProject(project_id);
    successResponse(res, { images }, "Project images fetched successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Delete image
exports.deleteProjectImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ProjectImageModel.deleteById(id);

    if (!deleted) throw new NotFoundError("Project image not found or already deleted");

    successResponse(res, { id: deleted.id }, "Project image deleted successfully");
  } catch (err) {
    next(err);
  }
};

const ProjectModel = require("../models/projectModel");
const ProjectImageModel = require("../models/projectImageModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// 🟩 Create Project
exports.createProject = async (req, res, next) => {
  try {
    const {
      provider_id,
      title,
      notes,
      location,
      land_size,
      project_type_id,
      design_id,
    } = req.body;

    if (!provider_id || !title) {
      throw new ValidationError("Provider ID and Title are required");
    }

    const project = await ProjectModel.create({
      provider_id,
      title,
      notes,
      location,
      land_size,
      project_type_id,
      design_id,
    });

    successResponse(res, { project }, "Project created successfully", 201);
  } catch (err) {
    next(err);
  }
};

// 🟩 Get all projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await ProjectModel.getAll();
    successResponse(
      res,
      { projects, count: projects.length },
      "Projects retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

// 🟩 Get project by ID (including images)
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await ProjectModel.findById(id);

    if (!project) throw new NotFoundError("Project not found");

    const images = await ProjectImageModel.getByProject(id);
    project.images = images;

    successResponse(res, { project }, "Project retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Update project by ID
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      notes,
      location,
      land_size,
      project_type_id,
      design_id,
    } = req.body;

    const updated = await ProjectModel.updateById(id, {
      title,
      notes,
      location,
      land_size,
      project_type_id,
      design_id,
    });

    if (!updated) throw new NotFoundError("Project not found for update");

    successResponse(res, { project: updated }, "Project updated successfully");
  } catch (err) {
    next(err);
  }
};

// 🟩 Delete project by ID
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ProjectModel.deleteById(id);

    if (!deleted) throw new NotFoundError("Project not found or already deleted");

    successResponse(res, { id: deleted.id }, "Project deleted successfully");
  } catch (err) {
    next(err);
  }
};

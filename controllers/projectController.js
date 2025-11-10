const ProjectModel = require("../models/projectModel");
const ProjectImageModel = require("../models/projectImageModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// 🟩 Create Project (with multiple image uploads and cover image flag)
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

    // 🧩 Step 1: Validate
    if (!provider_id || !title) {
      throw new ValidationError("Provider ID and Title are required");
    }

    // 🧩 Step 2: Create Project Entry
    const project = await ProjectModel.create({
      provider_id,
      title,
      notes,
      location,
      land_size,
      project_type_id,
      design_id,
    });

    const project_id = project.id;
    let savedImages = [];

    // 🧩 Step 3: Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      // Extract cover flags sent from frontend
      const coverFlags =
        req.body["is_cover_flags[]"] || req.body.is_cover_flags || [];

      // Normalize flags to array form
      const flagsArray = Array.isArray(coverFlags)
        ? coverFlags
        : [coverFlags];

      // Prepare image data
      const imageDataList = req.files.map((file, index) => {
        const isCover = flagsArray[index] === "true";
        return {
          project_id,
          provider_id,
          image_path: `/uploads/projects/${file.filename}`,
          is_cover: isCover,
        };
      });

      // If more than one image has is_cover = true, keep only the first as true
      const hasMultipleCovers = imageDataList.filter((img) => img.is_cover).length > 1;
      if (hasMultipleCovers) {
        let coverAssigned = false;
        imageDataList.forEach((img) => {
          if (img.is_cover && !coverAssigned) {
            coverAssigned = true;
          } else {
            img.is_cover = false;
          }
        });
      }

      // Save images in DB
      for (const img of imageDataList) {
        const savedImage = await ProjectImageModel.create(img);
        savedImages.push(savedImage);
      }

      // Attach images to project object
      project.images = savedImages;
    }

    // 🧩 Step 4: Send success response
    successResponse(res, { project }, "Project created successfully", 201);
  } catch (err) {
    console.error("❌ Error in createProject:", err);
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

    if (!deleted)
      throw new NotFoundError("Project not found or already deleted");

    successResponse(res, { id: deleted.id }, "Project deleted successfully");
  } catch (err) {
    next(err);
  }
};

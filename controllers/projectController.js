const ProjectModel = require("../models/projectModel");
const ProjectImageModel = require("../models/projectImageModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// 🟩 Create Project (with multiple image uploads + cover flag)
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

    // ✅ Step 1: Create Project Entry
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

    // ✅ Step 2: Handle Image Uploads
    if (req.files && req.files.length > 0) {
      // Capture cover flags array from FormData
      const coverFlags =
        req.body["is_cover_flags[]"] || req.body.is_cover_flags || [];

      // Normalize to array
      const flagsArray = Array.isArray(coverFlags)
        ? coverFlags
        : [coverFlags];

      // Map files + flags
      const imageDataList = req.files.map((file, index) => {
        const flagValue = flagsArray[index];
        const isCover =
          flagValue === true ||
          flagValue === "true" ||
          flagValue === "on" ||
          flagValue === 1;

        return {
          project_id,
          provider_id,
          image_path: `/uploads/projects/${file.filename}`,
          is_cover: isCover,
        };
      });

      // Ensure only one cover image (first true wins)
      let coverAssigned = false;
      imageDataList.forEach((img) => {
        if (img.is_cover && !coverAssigned) {
          coverAssigned = true;
        } else if (img.is_cover && coverAssigned) {
          img.is_cover = false;
        }
      });

      // Save images to DB
      for (const img of imageDataList) {
        const savedImage = await ProjectImageModel.create(img);
        savedImages.push(savedImage);
      }

      project.images = savedImages;
    }

    // ✅ Step 3: Send success response
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

// 🟩 Update project by ID (supports new image uploads)
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 🧩 Step 1: Parse body
    const {
      title,
      notes,
      location,
      land_size,
      project_type_id,
      design_id,
      provider_id, // optional but useful
      existing_cover_id, // 👈 newly added
    } = req.body;

    // 🧩 Step 2: Check project existence
    const existingProject = await ProjectModel.findById(id);
    if (!existingProject) throw new NotFoundError("Project not found for update");

    // 🧩 Step 3: Update main project info
    const updatedProject = await ProjectModel.updateById(id, {
      title,
      notes,
      location,
      land_size,
      project_type_id,
      design_id,
    });

    // 🧩 Step 4: Handle newly uploaded images (if any)
    let savedImages = [];
    if (req.files && req.files.length > 0) {
      const coverFlags =
        req.body["is_cover_flags[]"] || req.body.is_cover_flags || [];

      const flagsArray = Array.isArray(coverFlags)
        ? coverFlags
        : [coverFlags];

      // Prepare images data
      const imageDataList = req.files.map((file, index) => {
        const flagValue = flagsArray[index];
        const isCover =
          flagValue === true ||
          flagValue === "true" ||
          flagValue === "on" ||
          flagValue === 1;

        return {
          project_id: id,
          provider_id: provider_id || existingProject.provider_id,
          image_path: `/uploads/projects/${file.filename}`,
          is_cover: isCover,
        };
      });

      // Ensure only one cover image among new uploads
      let coverAssigned = false;
      imageDataList.forEach((img) => {
        if (img.is_cover && !coverAssigned) {
          coverAssigned = true;
        } else if (img.is_cover && coverAssigned) {
          img.is_cover = false;
        }
      });

      // Save new images to DB
      for (const img of imageDataList) {
        const savedImage = await ProjectImageModel.create(img);
        savedImages.push(savedImage);
      }
    }

    // 🧩 Step 5: Handle cover image update for existing images
    if (existing_cover_id) {
      // Remove all current covers for this project
      await ProjectImageModel.removeAllCovers(id);

      // Set selected one as cover
      await ProjectImageModel.setCoverById(existing_cover_id);
    }

    // 🧩 Step 6: Get all images (old + new)
    const allImages = await ProjectImageModel.getByProject(id);
    updatedProject.images = allImages;

    // 🧩 Step 7: Send success response
    successResponse(
      res,
      { project: updatedProject },
      "Project updated successfully"
    );
  } catch (err) {
    console.error("❌ Error in updateProject:", err);
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

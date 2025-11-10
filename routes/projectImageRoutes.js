const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const {
  createProjectImage,
  getImagesByProject,
  deleteProjectImage,
} = require("../controllers/projectImageController");

// 🟩 Multer storage config for project images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/uploads/projects");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

/* ================================
   Project Image Routes
   ================================ */

// Get all images by project
router.get("/:project_id", getImagesByProject);

// Upload project image
router.post("/", upload.fields([{ name: "image" }]), createProjectImage);

// Delete image by ID
router.delete("/:id", deleteProjectImage);

module.exports = router;

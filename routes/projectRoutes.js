const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

/* ===========================================================
   🟩 MULTER CONFIGURATION — for project image uploads
   =========================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/projects"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per image
});

/* ===========================================================
   🟩 PROJECT CRUD ROUTES
   =========================================================== */

// 🟩 Create a new project (with images)
router.post("/", upload.array("images", 10), createProject);

// 🟩 Get all projects
router.get("/", getProjects);

// 🟩 Get a single project by ID
router.get("/:id", getProjectById);

// 🟩 Update a project by ID (also supports new image uploads)
router.put("/:id", upload.array("images", 10), updateProject);

// 🟩 Delete a project
router.delete("/:id", deleteProject);

module.exports = router;

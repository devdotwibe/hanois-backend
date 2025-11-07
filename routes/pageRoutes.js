const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createPage, getListed } = require("../controllers/PageController");

// Temporary upload folder (Multer stores files here before moving them)
const upload = multer({ dest: path.join(__dirname, "../tmp") });

// 🟩 Routes
router.post("/save", upload.any(), createPage);
router.get("/get", getListed);

module.exports = router;

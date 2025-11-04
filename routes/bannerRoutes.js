const express = require("express");
const router = express.Router();
const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  updateSingleBanner,
  deleteBanner,
} = require("../controllers/bannerController");

// 🧠 Validate numeric IDs only for ID-based routes
router.param("id", (req, res, next, id) => {
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format — must be numeric",
    });
  }
  next();
});

// 🟩 Standard Routes
router.post("/", createBanner);    // Create
router.get("/", getBanners);       // Get all

// 🟩 This must be before :id routes to avoid "Invalid ID" error
router.put("/update-single", updateSingleBanner); // Update without ID (special case)

// 🟩 Routes that depend on a numeric ID
router.get("/:id", getBannerById);    // Get by ID
router.put("/:id", updateBanner);     // Update by ID
router.delete("/:id", deleteBanner);  // Delete by ID

module.exports = router;

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

// 🟩 Create a new banner
router.post("/", createBanner);

// 🟩 Get all banners (optional query filters: post_id, language)
router.get("/", getBanners);

// 🟩 Update first banner (special case)
router.put("/update-single", updateSingleBanner);

// 🟩 Get a single banner by ID
router.get("/:id", getBannerById);

// 🟩 Update a banner by ID
router.put("/:id", updateBanner);

// 🟩 Delete a banner by ID
router.delete("/:id", deleteBanner);

module.exports = router;

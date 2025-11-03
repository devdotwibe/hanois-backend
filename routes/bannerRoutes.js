const express = require("express");
const router = express.Router();

const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
} = require("../controllers/homeController"); // or '../controllers/bannerController' if you separate it later

// 🟩 Create a new banner
router.post("/", createBanner);

// 🟩 Get all banners
router.get("/", getBanners);

// 🟩 Get a single banner by ID
router.get("/:id", getBannerById);

// 🟩 Update a banner by ID
router.put("/:id", updateBanner);

// 🟩 Delete a banner by ID
router.delete("/:id", deleteBanner);

module.exports = router;

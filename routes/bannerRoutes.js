const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  updateSingleBanner,
  deleteBanner,
  updateBannerExtras, // 🟩 new controller for subtitle/subheading/buttonname
  getBannerExtras,    // 🟩 optional GET endpoint for extras
} = require("../controllers/bannerController");

// 🟩 Multer storage config
const uploadPath = path.join(__dirname, "../public/banner");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// 🟩 Validate ID param middleware
router.param("id", (req, res, next, id) => {
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format — must be numeric",
    });
  }
  next();
});

/* ============================
   🟩 ROUTE ORDER MATTERS
   ============================ */

// ✅ 1️⃣ Routes that DO NOT use ":id" (must come FIRST)
router.get("/", getBanners);

router.post(
  "/",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  createBanner
);

router.put(
  "/update-single",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  updateSingleBanner
);

// ✅ 2️⃣ New routes for Tab 2 extras
router.put("/update-extras", updateBannerExtras);
router.get("/extras", getBannerExtras);

// ✅ 3️⃣ Generic CRUD routes (must always be last)
router.get("/:id", getBannerById);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);

module.exports = router;

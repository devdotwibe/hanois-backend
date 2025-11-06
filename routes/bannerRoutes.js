const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  updateSingleBanner,
  deleteBanner,
  updateBannerExtras,   // 🟩 Tab 2 (subtitle, subheading, buttonname)
  getBannerExtras,       // 🟩 Fetch extras (Tab 2)
  updateBannerSubExtras, // 🟩 Tab 3 (subdescription, subbuttonname)
  getBannerSubExtras,    // 🟩 Fetch sub extras (Tab 3)
} = require("../controllers/bannerController");

/* ======================================================
   🟩 MULTER CONFIGURATION (for image uploads)
   ====================================================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/banners/"); // Folder where images are stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

/* ======================================================
   🟩 IMAGE UPLOAD ROUTE (Optional)
   ====================================================== */
// Example: POST /api/banner/upload
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    const filePath = `/uploads/banners/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get("host")}${filePath}`;
    res.json({ url: fullUrl }); // Frontend will receive this URL
  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

/* ======================================================
   🟩 ROUTE ORDER IS IMPORTANT IN EXPRESS
   ====================================================== */

/* ================================
   TAB 2 — Banner Extras (subtitle, subheading, buttonname)
   ================================ */
router.get("/extras", getBannerExtras);            // Fetch extras for Tab 2
router.put("/update-extras", updateBannerExtras);  // Update extras for Tab 2

/* ================================
   TAB 3 — Banner Sub Extras (subdescription, subbuttonname)
   ================================ */
router.get("/subextras", getBannerSubExtras);           // Fetch sub extras for Tab 3
router.put("/update-subextras", updateBannerSubExtras); // Update sub extras for Tab 3

/* ================================
   TAB 1 — Main Banner (title, description, images, headings)
   ================================ */
router.post("/", createBanner);                   // Create new banner (Tab 1)
router.get("/", getBanners);                      // List all banners

// 🟩 Updated: Accept multiple file uploads
router.put(
  "/update-single",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  updateSingleBanner
);

/* ================================
   ID-BASED ROUTES (must be last)
   ================================ */
router.get("/:id", getBannerById);                // Get banner by ID
router.put("/:id", updateBanner);                 // Update by ID
router.delete("/:id", deleteBanner);              // Delete by ID

module.exports = router;

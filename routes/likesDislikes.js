const express = require("express");
const router = express.Router();

const {
  react,
  removeReaction,
  getCounts,
  getReactions,
} = require("../controllers/LikesDislikesController");

const { authenticateToken } = require("../middleware/auth");

/* ======================================================
   🟩 REACTIONS ROUTES (LIKE / DISLIKE)
   ====================================================== */

// ✅ Add or update reaction (protected)
router.post("/", authenticateToken, react);

// ✅ Remove reaction (protected)
router.delete("/", authenticateToken, removeReaction);

// ✅ Get total counts for a project (public)
router.get("/count/:project_id", getCounts);

// ✅ Get all reactions for a project (public)
router.get("/list/:project_id", getReactions);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createComment,
  getCommentsByProject,
  deleteComment,
} = require("../controllers/CommentsController");

const { authenticateToken } = require("../middleware/auth");

/* ======================================================
   🟩 COMMENTS ROUTES
   ====================================================== */

// ✅ Create a comment or reply (protected)
router.post("/", authenticateToken, createComment);

// ✅ Get all comments & nested replies for a project
//    Protected → required for myReaction to work
router.get("/:project_id", authenticateToken, getCommentsByProject);

// ✅ Delete a comment by ID (protected)
router.delete("/:id", authenticateToken, deleteComment);

module.exports = router;

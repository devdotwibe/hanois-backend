const CommentsModel = require("../models/CommentsModel");
const LikesDislikesModel = require("../models/LikesDislikesModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

/* ======================================================
   🟩 CREATE COMMENT or REPLY
   ====================================================== */
exports.createComment = async (req, res, next) => {
  try {
    const { project_id, message, parent_id, user_id, provider_id } = req.body;

    if (!project_id) throw new ValidationError("project_id is required");
    if (!message) throw new ValidationError("message is required");

    const comment = await CommentsModel.create({
      project_id,
      user_id: user_id || null,
      provider_id: provider_id || null,
      message,
      parent_id: parent_id || null,
    });

    return successResponse(
      res,
      { comment },
      parent_id ? "Reply added successfully" : "Comment added successfully",
      201
    );
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🟩 GET COMMENTS + NESTED REPLIES FOR A PROJECT
   ====================================================== */
exports.getCommentsByProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;

    if (!project_id) throw new ValidationError("project_id is required");

    // Load comments
    const comments = await CommentsModel.getForProject(project_id);

    // Add likes/dislikes count to each comment (recursive)
    const enriched = await addReactionsToComments(comments);

    return successResponse(
      res,
      { comments: enriched, count: enriched.length },
      "Comments retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🟩 DELETE COMMENT BY ID
   ====================================================== */
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await CommentsModel.deleteById(id);
    if (!deleted) throw new NotFoundError("Comment not found or already deleted");

    return successResponse(
      res,
      { id: deleted.id },
      "Comment deleted successfully"
    );
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🟦 HELPER — Attach Likes & Dislikes to Each Comment
   ====================================================== */
async function addReactionsToComments(comments) {
  const updated = [];

  for (const c of comments) {
    // Get counts for this comment
    const counts = await LikesDislikesModel.countReactions(c.id);

    const enriched = {
      ...c,
      likes: Number(counts.likes) || 0,
      dislikes: Number(counts.dislikes) || 0,
    };

    // If comment has replies, recursively add counts
    if (c.replies && c.replies.length > 0) {
      enriched.replies = await addReactionsToComments(c.replies);
    }

    updated.push(enriched);
  }

  return updated;
}

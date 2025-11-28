const CommentsModel = require("../models/CommentsModel");
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

    // ⭐ user_id and provider_id both allowed to be null
    const comment = await CommentsModel.create({
      project_id,
      user_id: user_id || null,           // nullable
      provider_id: provider_id || null,   // nullable
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

    const comments = await CommentsModel.getForProject(project_id);

    return successResponse(
      res,
      { comments, count: comments.length },
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

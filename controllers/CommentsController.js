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

    // Load all comments with nested replies
    const comments = await CommentsModel.getForProject(project_id);

    // Identify who is reading (for myReaction)
    let user_id = null;
    let provider_id = null;

    if (req.user?.role === "user") user_id = req.user.id;
    if (req.user?.role === "provider") provider_id = req.user.id;

    // Recursive function to attach likes/dislikes & myReaction
    const addReactions = async (list) => {
      for (let c of list) {
        const counts = await LikesDislikesModel.countReactions(c.id);

        const my = await LikesDislikesModel.findReaction({
          user_id,
          provider_id,
          comment_id: c.id,
        });

        c.likes = Number(counts.likes) || 0;
        c.dislikes = Number(counts.dislikes) || 0;
        c.myReaction = my ? my.type : null;

        if (c.replies?.length > 0) {
          await addReactions(c.replies);
        }
      }
      return list;
    };

    const enriched = await addReactions(comments);

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

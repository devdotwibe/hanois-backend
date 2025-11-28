const LikesDislikesModel = require("../models/LikesDislikesModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

// Add or update reaction
exports.react = async (req, res, next) => {
  try {
    const { project_id, type } = req.body;
    const user_id = req.user?.id || req.body.user_id;

    if (!project_id) throw new ValidationError("project_id is required");
    if (!["like", "dislike"].includes(type))
      throw new ValidationError("Reaction type must be either 'like' or 'dislike'");

    const reaction = await LikesDislikesModel.react(user_id, project_id, type);

    return successResponse(
      res,
      { reaction },
      `Reaction updated to '${type}' successfully`,
      200
    );
  } catch (err) {
    next(err);
  }
};

// Remove reaction
exports.removeReaction = async (req, res, next) => {
  try {
    const { project_id } = req.body;
    const user_id = req.user?.id || req.body.user_id;

    if (!project_id) throw new ValidationError("project_id is required");

    const deleted = await LikesDislikesModel.removeReaction(user_id, project_id);
    if (!deleted) throw new NotFoundError("No reaction found to remove");

    return successResponse(res, { id: deleted.id }, "Reaction removed successfully");
  } catch (err) {
    next(err);
  }
};

// Get total likes & dislikes
exports.getCounts = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    if (!project_id) throw new ValidationError("project_id is required");

    const counts = await LikesDislikesModel.countReactions(project_id);

    return successResponse(res, { counts }, "Reactions count retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// Get list of reactions
exports.getReactions = async (req, res, next) => {
  try {
    const { project_id } = req.params;

    if (!project_id) throw new ValidationError("project_id is required");

    const reactions = await LikesDislikesModel.getReactions(project_id);

    return successResponse(
      res,
      { reactions, count: reactions.length },
      "Reactions retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

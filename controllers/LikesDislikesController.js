const LikesDislikesModel = require("../models/LikesDislikesModel");
const { successResponse } = require("../utils/response");
const { ValidationError, NotFoundError } = require("../utils/errors");

/* ======================================================
   🟩 ADD or UPDATE reaction for a COMMENT
   ====================================================== */
exports.react = async (req, res, next) => {
  try {
    const { comment_id, type } = req.body;

    if (!comment_id) throw new ValidationError("comment_id is required");
    if (!["like", "dislike"].includes(type))
      throw new ValidationError("Reaction type must be either 'like' or 'dislike'");

    // Identify who is reacting
    let user_id = null;
    let provider_id = null;

    // Always trust req.user (from token), never body
    if (req.user) {
      if (req.user.role === "user") user_id = req.user.id;
      if (req.user.role === "provider") provider_id = req.user.id;
    }

    // No identity = no reaction
    if (!user_id && !provider_id) {
      throw new ValidationError("Unable to determine reacting user");
    }

    const reaction = await LikesDislikesModel.react({
      user_id,
      provider_id,
      comment_id,
      type,
    });

    return successResponse(
      res,
      { reaction },
      `Reaction '${type}' saved`,
      200
    );

  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🟩 REMOVE reaction for a COMMENT
   ====================================================== */
exports.removeReaction = async (req, res, next) => {
  try {
    const { comment_id } = req.body;

    if (!comment_id) throw new ValidationError("comment_id is required");

    let user_id = null;
    let provider_id = null;

    if (req.user) {
      if (req.user.role === "user") user_id = req.user.id;
      if (req.user.role === "provider") provider_id = req.user.id;
    }

    if (!user_id && !provider_id) {
      throw new ValidationError("Unable to determine reacting user");
    }

    const deleted = await LikesDislikesModel.removeReaction({
      user_id,
      provider_id,
      comment_id,
    });

    if (!deleted) throw new NotFoundError("No reaction found");

    return successResponse(
      res,
      { id: deleted.id },
      "Reaction removed"
    );

  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🟩 COUNT reactions for a COMMENT
   ====================================================== */
exports.getCounts = async (req, res, next) => {
  try {
    const { comment_id } = req.params;

    if (!comment_id) throw new ValidationError("comment_id is required");

    const counts = await LikesDislikesModel.countReactions(comment_id);

    return successResponse(
      res,
      { counts },
      "Counts retrieved"
    );

  } catch (err) {
    next(err);
  }
};

/* ======================================================
   🟩 LIST reactions for a COMMENT
   ====================================================== */
exports.getReactions = async (req, res, next) => {
  try {
    const { comment_id } = req.params;

    if (!comment_id) throw new ValidationError("comment_id is required");

    const reactions = await LikesDislikesModel.getReactions(comment_id);

    return successResponse(
      res,
      { reactions, count: reactions.length },
      "Reactions retrieved"
    );

  } catch (err) {
    next(err);
  }
};

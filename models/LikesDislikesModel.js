const pool = require("../db/pool");

class LikesDislikesModel {
  /* ======================================================
     🟩 ADD or UPDATE REACTION (LIKE / DISLIKE)
     - Supports user_id OR provider_id
  ====================================================== */
  static async react({ user_id = null, provider_id = null, comment_id, type }) {
    if (!comment_id) throw new Error("comment_id is required");
    if (!type) throw new Error("Reaction type is required");

    // Check existing reaction
    const existing = await this.findReaction({ user_id, provider_id, comment_id });

    if (existing) {
      // Update the existing reaction
      const result = await pool.query(
        `UPDATE likes_dislikes
         SET type = $1, created_at = NOW()
         WHERE comment_id = $2 
           AND (user_id = $3 OR (user_id IS NULL AND $3 IS NULL))
           AND (provider_id = $4 OR (provider_id IS NULL AND $4 IS NULL))
         RETURNING *`,
        [type, comment_id, user_id, provider_id]
      );
      return result.rows[0];
    }

    // Insert new reaction
    const result = await pool.query(
      `INSERT INTO likes_dislikes (user_id, provider_id, comment_id, type, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [user_id, provider_id, comment_id, type]
    );

    return result.rows[0];
  }

  /* ======================================================
     🟩 FIND EXISTING REACTION
  ====================================================== */
  static async findReaction({ user_id = null, provider_id = null, comment_id }) {
    const result = await pool.query(
      `SELECT * FROM likes_dislikes
       WHERE comment_id = $1
         AND (user_id = $2 OR (user_id IS NULL AND $2 IS NULL))
         AND (provider_id = $3 OR (provider_id IS NULL AND $3 IS NULL))
       LIMIT 1`,
      [comment_id, user_id, provider_id]
    );
    return result.rows[0];
  }

  /* ======================================================
     🟩 REMOVE REACTION
  ====================================================== */
  static async removeReaction({ user_id = null, provider_id = null, comment_id }) {
    const result = await pool.query(
      `DELETE FROM likes_dislikes
       WHERE comment_id = $1
         AND (user_id = $2 OR (user_id IS NULL AND $2 IS NULL))
         AND (provider_id = $3 OR (provider_id IS NULL AND $3 IS NULL))
       RETURNING id`,
      [comment_id, user_id, provider_id]
    );
    return result.rows[0];
  }

  /* ======================================================
     🟩 COUNT LIKE / DISLIKE FOR A COMMENT
  ====================================================== */
  static async countReactions(comment_id) {
    const result = await pool.query(
      `SELECT 
          SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) AS likes,
          SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) AS dislikes
       FROM likes_dislikes
       WHERE comment_id = $1`,
      [comment_id]
    );

    return result.rows[0] || { likes: 0, dislikes: 0 };
  }

  /* ======================================================
     🟩 GET ALL REACTIONS FOR A COMMENT
  ====================================================== */
  static async getReactions(comment_id) {
    const result = await pool.query(
      `SELECT * FROM likes_dislikes
       WHERE comment_id = $1
       ORDER BY created_at DESC`,
      [comment_id]
    );
    return result.rows;
  }
}

module.exports = LikesDislikesModel;

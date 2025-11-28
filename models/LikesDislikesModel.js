const pool = require("../db/pool");

class LikesDislikesModel {

  /* ======================================================
     🟩 ADD or UPDATE REACTION (LIKE / DISLIKE)
     ====================================================== */
  static async react({ user_id = null, provider_id = null, comment_id, type }) {
    if (!comment_id) throw new Error("comment_id is required");

    // Check existing reaction
    const existing = await this.findReaction({ user_id, provider_id, comment_id });

    if (existing) {
      // UPDATE reaction
      const result = await pool.query(
        `UPDATE likes_dislikes
         SET type = $1, created_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [type, existing.id]
      );
      return result.rows[0];
    }

    // INSERT new reaction
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
    let query;
    let params;

    if (user_id !== null) {
      // Logged-in USER
      query = `
        SELECT *
        FROM likes_dislikes
        WHERE comment_id = $1 AND user_id = $2
        LIMIT 1
      `;
      params = [comment_id, user_id];

    } else if (provider_id !== null) {
      // Logged-in PROVIDER
      query = `
        SELECT *
        FROM likes_dislikes
        WHERE comment_id = $1 AND provider_id = $2
        LIMIT 1
      `;
      params = [comment_id, provider_id];

    } else {
      // No identity — no reaction possible
      return null;
    }

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  /* ======================================================
     🟩 REMOVE REACTION
     ====================================================== */
  static async removeReaction({ user_id = null, provider_id = null, comment_id }) {
    let query;
    let params;

    if (user_id !== null) {
      query = `
        DELETE FROM likes_dislikes
        WHERE comment_id = $1 AND user_id = $2
        RETURNING id
      `;
      params = [comment_id, user_id];
    } else {
      query = `
        DELETE FROM likes_dislikes
        WHERE comment_id = $1 AND provider_id = $2
        RETURNING id
      `;
      params = [comment_id, provider_id];
    }

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  /* ======================================================
     🟩 COUNT LIKE / DISLIKE FOR A COMMENT
     ====================================================== */
  static async countReactions(comment_id) {
    const result = await pool.query(
      `SELECT 
          COUNT(*) FILTER (WHERE type = 'like') AS likes,
          COUNT(*) FILTER (WHERE type = 'dislike') AS dislikes
       FROM likes_dislikes
       WHERE comment_id = $1`,
      [comment_id]
    );

    return {
      likes: Number(result.rows[0].likes) || 0,
      dislikes: Number(result.rows[0].dislikes) || 0,
    };
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

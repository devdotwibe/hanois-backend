const pool = require("../db/pool");

class LikesDislikesModel {
  // 🟩 Add or update reaction
  static async react(user_id, project_id, type) {
    // Check existing reaction
    const existing = await this.findUserReaction(user_id, project_id);

    if (existing) {
      // Update reaction
      const result = await pool.query(
        `UPDATE likes_dislikes 
         SET type = $1, created_at = NOW()
         WHERE user_id = $2 AND project_id = $3
         RETURNING *`,
        [type, user_id, project_id]
      );
      return result.rows[0];
    }

    // Insert new reaction
    const result = await pool.query(
      `INSERT INTO likes_dislikes (user_id, project_id, type, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [user_id, project_id, type]
    );

    return result.rows[0];
  }

  // 🟩 Get user's reaction
  static async findUserReaction(user_id, project_id) {
    const result = await pool.query(
      `SELECT * FROM likes_dislikes 
       WHERE user_id = $1 AND project_id = $2
       LIMIT 1`,
      [user_id, project_id]
    );
    return result.rows[0];
  }

  // 🟩 Remove reaction
  static async removeReaction(user_id, project_id) {
    const result = await pool.query(
      `DELETE FROM likes_dislikes 
       WHERE user_id = $1 AND project_id = $2
       RETURNING id`,
      [user_id, project_id]
    );

    return result.rows[0];
  }

  // 🟩 Count likes/dislikes for a project
  static async countReactions(project_id) {
    const result = await pool.query(
      `SELECT 
          SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) AS likes,
          SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) AS dislikes
       FROM likes_dislikes
       WHERE project_id = $1`,
      [project_id]
    );

    return result.rows[0] || { likes: 0, dislikes: 0 };
  }

  // 🟩 Get all reactions for a project
  static async getReactions(project_id) {
    const result = await pool.query(
      `SELECT * FROM likes_dislikes
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [project_id]
    );
    return result.rows;
  }
}

module.exports = LikesDislikesModel;

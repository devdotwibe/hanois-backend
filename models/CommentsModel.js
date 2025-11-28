const pool = require("../db/pool");

class CommentsModel {
  // 🟩 Add comment (or reply)
  static async create({ project_id, user_id, message, parent_id = null }) {
    const result = await pool.query(
      `INSERT INTO comments (project_id, user_id, message, parent_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [project_id, user_id, message, parent_id]
    );
    return result.rows[0];
  }

  // 🟩 Get main comments + replies
  static async getForProject(project_id) {
    const result = await pool.query(
      `SELECT * FROM comments
       WHERE project_id = $1
       ORDER BY created_at ASC`,
      [project_id]
    );

    const rows = result.rows;

    // Build nested comment structure
    const map = {};
    const rootComments = [];

    rows.forEach((c) => {
      c.replies = [];
      map[c.id] = c;
    });

    rows.forEach((c) => {
      if (c.parent_id) {
        if (map[c.parent_id]) {
          map[c.parent_id].replies.push(c);
        }
      } else {
        rootComments.push(c);
      }
    });

    return rootComments;
  }

  // 🟩 Find comment by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM comments WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 Delete single comment (auto-deletes replies via ON DELETE CASCADE)
  static async deleteById(id) {
    const result = await pool.query(
      `DELETE FROM comments WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 Delete all comments for a project
  static async deleteForProject(project_id) {
    await pool.query(
      `DELETE FROM comments WHERE project_id = $1`,
      [project_id]
    );
    return { message: "All comments deleted for this project" };
  }
}

module.exports = CommentsModel;

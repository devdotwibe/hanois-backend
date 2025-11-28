const pool = require("../db/pool");

class CommentsModel {
  /* ======================================================
     🟩 CREATE COMMENT OR REPLY
     ====================================================== */
  static async create({ project_id, user_id = null, provider_id = null, message, parent_id = null }) {
    const result = await pool.query(
      `INSERT INTO comments (project_id, user_id, provider_id, message, parent_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [project_id, user_id, provider_id, message, parent_id]
    );
    return result.rows[0];
  }

  /* ======================================================
     🟩 GET COMMENTS + NESTED REPLIES FOR A PROJECT
     ====================================================== */
  static async getForProject(project_id) {
    const result = await pool.query(
      `SELECT * FROM comments
       WHERE project_id = $1
       ORDER BY created_at ASC`,
      [project_id]
    );

    const rows = result.rows;

    // Build nested structure
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

  /* ======================================================
     🟩 FIND COMMENT BY ID
     ====================================================== */
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM comments WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /* ======================================================
     🟩 DELETE COMMENT BY ID (CASCADE REMOVES REPLIES)
     ====================================================== */
  static async deleteById(id) {
    const result = await pool.query(
      `DELETE FROM comments WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }

  /* ======================================================
     🟩 DELETE ALL COMMENTS FOR A PROJECT
     ====================================================== */
  static async deleteForProject(project_id) {
    await pool.query(
      `DELETE FROM comments WHERE project_id = $1`,
      [project_id]
    );
    return { message: "All comments deleted for this project" };
  }
}

module.exports = CommentsModel;

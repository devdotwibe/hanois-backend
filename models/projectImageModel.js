const pool = require("../db/pool");

class projectImageModel {
  static async getByProject(project_id) {
    const result = await pool.query("SELECT * FROM projectimages WHERE project_id = $1", [project_id]);
    return result.rows;
  }

  static async create(data) {
    const { project_id, provider_id, image_path } = data;

    const result = await pool.query(
      `INSERT INTO projectimages (project_id, provider_id, image_path, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [project_id, provider_id, image_path]
    );

    return result.rows[0];
  }

  static async deleteById(id) {
    const result = await pool.query(
      "DELETE FROM projectimages WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = projectImageModel;

const pool = require("../db/pool");

class projectImageModel {
  // 🟩 Get all images for a specific project
  static async getByProject(project_id) {
    const result = await pool.query(
      "SELECT * FROM projectimages WHERE project_id = $1 ORDER BY id ASC",
      [project_id]
    );
    return result.rows;
  }

  // 🟩 Create a new project image record
  static async create(data) {
    const { project_id, provider_id, image_path, is_cover = false } = data;

    const result = await pool.query(
      `INSERT INTO projectimages (project_id, provider_id, image_path, is_cover, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [project_id, provider_id, image_path, is_cover]
    );

    return result.rows[0];
  }

  // 🟩 Set a specific image as the cover image (only one per project)
  static async setCoverImage(project_id, image_id) {
    // Reset other images for the project
    await pool.query(`UPDATE projectimages SET is_cover = false WHERE project_id = $1`, [project_id]);

    // Set selected one as cover
    const result = await pool.query(
      `UPDATE projectimages SET is_cover = true WHERE id = $1 RETURNING *`,
      [image_id]
    );

    return result.rows[0];
  }

  // 🟩 Delete image by ID
  static async deleteById(id) {
    const result = await pool.query(
      "DELETE FROM projectimages WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = projectImageModel;

const pool = require("../db/pool");

class ProjectImageModel {
  // 🟩 Get all images for a specific project
  static async getByProject(project_id) {
    const result = await pool.query(
      `SELECT id, project_id, provider_id, image_path, is_cover, created_at
       FROM projectimages
       WHERE project_id = $1
       ORDER BY is_cover DESC, id ASC`,
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
       RETURNING id, project_id, provider_id, image_path, is_cover`,
      [project_id, provider_id, image_path, is_cover]
    );

    return result.rows[0];
  }

  // 🟩 Set a specific image as the cover image (only one per project)
  static async setCoverImage(project_id, image_id) {
    // Reset all other images for this project
    await pool.query(
      `UPDATE projectimages
       SET is_cover = false
       WHERE project_id = $1`,
      [project_id]
    );

    // Set selected one as the new cover
    const result = await pool.query(
      `UPDATE projectimages
       SET is_cover = true
       WHERE id = $1
       RETURNING id, project_id, provider_id, image_path, is_cover`,
      [image_id]
    );

    return result.rows[0];
  }

  // 🟩 Delete image by ID
  static async deleteById(id) {
    const result = await pool.query(
      `DELETE FROM projectimages
       WHERE id = $1
       RETURNING id, image_path`,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 Optional: Get single image by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT id, project_id, provider_id, image_path, is_cover
       FROM projectimages
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 NEW: Remove all cover flags for a given project
  static async removeAllCovers(project_id) {
    await pool.query(
      `UPDATE projectimages SET is_cover = false WHERE project_id = $1`,
      [project_id]
    );
  }

  // 🟩 NEW: Set one image as cover by its ID
  static async setCoverById(image_id) {
    await pool.query(
      `UPDATE projectimages SET is_cover = true WHERE id = $1`,
      [image_id]
    );
  }
}

module.exports = ProjectImageModel;

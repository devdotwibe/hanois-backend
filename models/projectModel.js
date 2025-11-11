const pool = require("../db/pool");

class projectModel {
  // 🟩 Get all projects with joined category, design names, and images
  static async getAll() {
    const result = await pool.query(`
      SELECT 
        p.*, 
        c.name AS project_type_name,
        d.name AS design_name,
        -- Get the cover image (is_cover = true)
        (
          SELECT pi.image_path
          FROM projectimages pi
          WHERE pi.project_id = p.id AND pi.is_cover = true
          LIMIT 1
        ) AS cover_image,
        -- Get all images as a JSON array
        (
          SELECT json_agg(json_build_object(
            'id', pi.id,
            'image_path', pi.image_path,
            'is_cover', pi.is_cover
          ))
          FROM projectimages pi
          WHERE pi.project_id = p.id
        ) AS images
      FROM projects p
      LEFT JOIN categories c ON p.project_type_id = c.id
      LEFT JOIN design d ON p.design_id = d.id
      ORDER BY p.id DESC
    `);
    return result.rows;
  }

  // 🟩 Find project by ID (with joins + images)
  static async findById(id) {
    const result = await pool.query(
      `
      SELECT 
        p.*, 
        c.name AS project_type_name,
        d.name AS design_name,
        -- Cover image
        (
          SELECT pi.image_path
          FROM projectimages pi
          WHERE pi.project_id = p.id AND pi.is_cover = true
          LIMIT 1
        ) AS cover_image,
        -- All images
        (
          SELECT json_agg(json_build_object(
            'id', pi.id,
            'image_path', pi.image_path,
            'is_cover', pi.is_cover
          ))
          FROM projectimages pi
          WHERE pi.project_id = p.id
        ) AS images
      FROM projects p
      LEFT JOIN categories c ON p.project_type_id = c.id
      LEFT JOIN design d ON p.design_id = d.id
      WHERE p.id = $1
      `,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 Create a new project (with type and design IDs)
  static async create(data) {
    const {
      provider_id,
      title,
      notes,
      location,
      land_size,
      project_type_id,
      design_id,
    } = data;

    const result = await pool.query(
      `
      INSERT INTO projects 
        (provider_id, title, notes, location, land_size, project_type_id, design_id, created_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
      `,
      [
        provider_id,
        title,
        notes,
        location,
        land_size,
        project_type_id,
        design_id,
      ]
    );

    return result.rows[0];
  }

  // 🟩 Update an existing project
  static async updateById(id, data) {
    const {
      title,
      notes,
      location,
      land_size,
      project_type_id,
      design_id,
    } = data;

    const result = await pool.query(
      `
      UPDATE projects 
      SET 
        title = COALESCE($1, title),
        notes = COALESCE($2, notes),
        location = COALESCE($3, location),
        land_size = COALESCE($4, land_size),
        project_type_id = COALESCE($5, project_type_id),
        design_id = COALESCE($6, design_id),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [title, notes, location, land_size, project_type_id, design_id, id]
    );

    return result.rows[0];
  }

  // 🟩 Delete project by ID
  static async deleteById(id) {
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING id, title",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = projectModel;

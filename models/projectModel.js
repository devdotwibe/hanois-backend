const pool = require("../db/pool");

class projectModel {
  static async getAll() {
    const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { provider_id, title, notes, location, land_size } = data;

    const result = await pool.query(
      `INSERT INTO projects (provider_id, title, notes, location, land_size, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [provider_id, title, notes, location, land_size]
    );
    return result.rows[0];
  }

  static async updateById(id, data) {
    const { title, notes, location, land_size } = data;
    const result = await pool.query(
      `UPDATE projects 
       SET title=$1, notes=$2, location=$3, land_size=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [title, notes, location, land_size, id]
    );
    return result.rows[0];
  }

  static async deleteById(id) {
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING id, title",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = projectModel;

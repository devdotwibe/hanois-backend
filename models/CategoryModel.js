const pool = require("../db/pool");

class CategoryModel {
  static async getAll() {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { name } = data;

    const result = await pool.query(
      `INSERT INTO categories (name, created_at)
       VALUES ($1, NOW())
       RETURNING id, name, created_at`,
      [name]
    );

    return result.rows[0];
  }

  static async updateById(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    values.push(id);

    const query = `
      UPDATE categories
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, created_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deleteById(id) {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id, name",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = CategoryModel;

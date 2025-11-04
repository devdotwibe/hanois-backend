const pool = require("../db/pool");

class PostModel {
  // 🟩 Create new post
  static async create(data) {
    const { name } = data;

    // Prevent duplicate post names
    const existing = await this.findByName(name);
    if (existing) return existing; // Return existing record instead of creating duplicate

    const result = await pool.query(
      `INSERT INTO post (name, created_at, updated_at)
       VALUES ($1, NOW(), NOW())
       RETURNING id, name, created_at, updated_at`,
      [name]
    );

    return result.rows[0];
  }

  // 🟩 Get all posts
  static async getAll() {
    const result = await pool.query(`
      SELECT id, name, created_at, updated_at
      FROM post
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  // 🟩 Find post by ID
  static async findById(id) {
    if (isNaN(id)) throw new Error("Invalid ID format — must be numeric");

    const result = await pool.query(
      `SELECT id, name, created_at, updated_at 
       FROM post 
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // 🟩 Find post by name (used in banner controller)
  static async findByName(name) {
    const result = await pool.query(
      `SELECT id, name, created_at, updated_at 
       FROM post 
       WHERE LOWER(name) = LOWER($1)
       LIMIT 1`,
      [name]
    );
    return result.rows[0];
  }

  // 🟩 Update post by ID
  static async updateById(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (fields.length === 0) return null;

    // Always update timestamp
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE post 
       SET ${fields.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING id, name, created_at, updated_at`,
      values
    );

    return result.rows[0];
  }

  // 🟩 Delete post by ID
  static async deleteById(id) {
    if (isNaN(id)) throw new Error("Invalid ID format — must be numeric");

    const result = await pool.query(
      `DELETE FROM post WHERE id = $1 RETURNING id`,
      [id]
    );

    return result.rows[0];
  }

  // 🟩 Delete all posts (useful for cleanup/testing)
  static async deleteAll() {
    await pool.query(`TRUNCATE TABLE post RESTART IDENTITY CASCADE;`);
    return { message: "All posts deleted successfully" };
  }
}

module.exports = PostModel;

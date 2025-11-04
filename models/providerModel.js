const pool = require("../db/pool");
const bcrypt = require('bcrypt');

class ProviderModel {
  static async getAll() {
    const result = await pool.query("SELECT * FROM providers");
    return result.rows;
  }


  static async updatePassword(providerId, hashedPassword) {
    const result = await pool.query(
      "UPDATE providers SET password = $1 WHERE id = $2 RETURNING id, email",
      [hashedPassword, providerId]
    );
    return result.rows[0];
  }

  static async create(data) {
    const {
      name,
      email,
      phone,
      register_no,
      password,
      location,
      team_size,
      service,
      website,
      social_media
    } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO providers 
       (name, email, phone, register_no, password, location, team_size, service, website, social_media, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
       RETURNING id, name, email, phone, location, service, created_at`,
      [name, email, phone, register_no, hashedPassword, location, team_size, service, website, social_media]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE id = $1", 
      [id]
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
    if (data.email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.phone) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      fields.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, phone, created_at`,
      values
    );
    return result.rows[0];
  }

  static async deleteById(id) {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    return result.rows[0];
  }
}

module.exports = ProviderModel;

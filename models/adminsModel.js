const pool = require("../db/pool");

class AdminsModel {
  static async getAll() {
    const result = await pool.query("SELECT * FROM admins");
    return result.rows;
  }

  static async create(data) {
    const { name, email, password } = data;
    const result = await pool.query(
      "INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM admins WHERE id = $1", [id]);
    return result.rows[0];
  }
}

module.exports = AdminsModel;
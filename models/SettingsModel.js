const pool = require("../db/pool");

class SettingsModel {
  static async findByKey(key) {
    const result = await pool.query(
      `SELECT * FROM settings WHERE key = $1`,
      [key]
    );
    return result.rows[0];
  }

  static async upsert(key, value) {
    const result = await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, value]
    );
    return result.rows[0];
  }
}

module.exports = SettingsModel;

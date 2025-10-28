import pool from "../db.js";

export default class AdminsModel {
  static async getAll() {
    const result = await pool.query("SELECT * FROM admins");
    return result.rows;
  }

  static async create(data) {
    // TODO: add field mappings
    return data;
  }
}
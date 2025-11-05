const pool = require("../db");

exports.findByKey = async (key) => {
  const result = await pool.query("SELECT * FROM sections WHERE key = $1", [key]);
  return result.rows[0];
};

exports.create = async ({ key }) => {
  const result = await pool.query(
    "INSERT INTO sections (key) VALUES ($1) RETURNING *",
    [key]
  );
  return result.rows[0];
};

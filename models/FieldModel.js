const pool = require("../db");

exports.findBySectionAndKey = async (section_id, key) => {
  const result = await pool.query(
    "SELECT * FROM fields WHERE section_id = $1 AND key = $2",
    [section_id, key]
  );
  return result.rows[0];
};

exports.create = async ({ section_id, key, type }) => {
  const result = await pool.query(
    "INSERT INTO fields (section_id, key, type) VALUES ($1, $2, $3) RETURNING *",
    [section_id, key, type]
  );
  return result.rows[0];
};

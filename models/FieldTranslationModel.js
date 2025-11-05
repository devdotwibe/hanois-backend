const pool = require("../db");

exports.upsert = async (field_id, language, value) => {
  const result = await pool.query(
    `INSERT INTO field_translations (field_id, language, value)
     VALUES ($1, $2, $3)
     ON CONFLICT (field_id, language) DO UPDATE SET value = EXCLUDED.value
     RETURNING *`,
    [field_id, language, value]
  );
  return result.rows[0];
};

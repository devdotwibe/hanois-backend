const pool = require("../db/pool");

export const getAllTables = async (req, res) => {
  try {

    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = [];

    for (const row of tablesResult.rows) {
      const columnsResult = await pool.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1;
      `, [row.table_name]);

      tables.push({
        table: row.table_name,
        columns: columnsResult.rows
      });
    }

    res.json({
      success: true,
      message: "Schema retrieved successfully",
      data: tables
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error retrieving schema" });
  }
};

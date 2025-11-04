const pool = require("../db/pool");

const getAllTables = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json({ tables: result.rows });
  } catch (err) {
    next(err);
  }
};

const getTableSchema = async (req, res, next) => {
  try {
    const { tableName } = req.params;
    const result = await pool.query(
      `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
      `,
      [tableName]
    );
    res.json({ schema: result.rows });
  } catch (err) {
    next(err);
  }
};

const getAllTablesWithSchema = async (req, res, next) => {
  try {

    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows;

    const fullSchema = await Promise.all(
      tables.map(async (t) => {
        const columnsResult = await pool.query(
          `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
          `,
          [t.table_name]
        );

        return {
          table: t.table_name,
          columns: columnsResult.rows,
        };
      })
    );

    res.json({
      success: true,
      data: fullSchema,
    });
  } catch (err) {
    console.error("Error fetching table schema:", err);
    next(err);
  }
};

module.exports = { getAllTables, getTableSchema ,getAllTablesWithSchema};

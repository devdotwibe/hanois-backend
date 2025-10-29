const express = require('express');
const router = express.Router();
const pool = require('../db/pool'); // your PostgreSQL pool

// GET /api/db/tables - list all tables in public schema
router.get('/tables', async (req, res) => {
  try {
    const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;
    const result = await pool.query(query);
    res.json({ tables: result.rows.map(row => row.table_name) });
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/db/columns/:table - list all columns of a table
router.get('/columns/:table', async (req, res) => {
  try {
    const tableName = req.params.table;

    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
        AND table_schema = 'public';
    `;
    const result = await pool.query(query, [tableName]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found or has no columns' });
    }

    res.json({ columns: result.rows });
  } catch (err) {
    console.error('Error fetching columns:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

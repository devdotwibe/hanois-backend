const { Pool } = require('pg');
const { config } = require('../config/env');

const pool = new Pool(config.db);

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to DB', err.stack);
    process.exit(-1);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

module.exports = pool;

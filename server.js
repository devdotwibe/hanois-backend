// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 5000;
const bcrypt = require('bcrypt');
// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // later change to 'https://hanois.dotwibe.com'
  methods: ['GET', 'POST'],
}));

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Hanois Backend!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


app.get('/api/admins/create-table', async (req, res) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    res.json({ message: 'Admins table created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/admins/insert-test', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('12345678', 10);

    const insertQuery = `
      INSERT INTO admins (name, email, password)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, ['Admin', 'admin@hanois.com', hashedPassword]);

    res.json({ message: 'Test admin inserted', admin: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



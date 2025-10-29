// controllers/userController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, number, password } = req.body;
    if (!firstName || !lastName || !email || !number || !password) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${lastName}`;

    const insertQuery = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at;
    `;
    const result = await pool.query(insertQuery, [fullName, email, hashedPassword]);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Register Error:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

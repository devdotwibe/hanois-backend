// controllers/userController.js
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Create a new Pool instance with your PostgreSQL connection settings
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Controller for user registration (Sign Up)
exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, mobile, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !mobile || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Check if the email already exists
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const query = `
      INSERT INTO users (first_name, last_name, email, mobile, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, email, mobile;
    `;
    const result = await pool.query(query, [firstName, lastName, email, mobile, hashedPassword]);

    // Return the created user (without password)
    const newUser = result.rows[0];
    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

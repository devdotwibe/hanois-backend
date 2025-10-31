import User from '../models/User.js';

import pool from "../db/pool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";




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

  export const getUsers = async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
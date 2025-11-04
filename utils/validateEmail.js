const pool = require("../db/pool");

const validateEmail = async (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }

  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    const providerResult = await pool.query(
      'SELECT id FROM providers WHERE email = $1 LIMIT 1',
      [email]
    );

    if (userResult.rows.length > 0 || providerResult.rows.length > 0) {
      return { valid: false, message: 'Email already exists' };
    }

    return { valid: true };

  } catch (error) {
    console.error('Error validating email:', error);
    return { valid: false, message: 'Server error while validating email' };
  }
};

module.exports = { validateEmail };

const UsersModel = require('../models/usersModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { config } = require('../config/env');
const { successResponse, errorResponse } = require('../utils/response');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errors');
const { validateEmail } = require('../utils/validateEmail');
const pool = require("../db/pool");
const WorkModel = require('../models/workModel');

exports.registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const emailCheck = await validateEmail(email);

    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.message });
    }

    const existingUser = await UsersModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const fullName = `${firstName} ${lastName}`;
    const user = await UsersModel.create({
      name: fullName,
      email,
      password,
      phone: phone || null,
    });

    successResponse(
      res, 
      { user }, 
      'User registered successfully', 
      201
    );
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await UsersModel.getAll();
    successResponse(res, { users, count: users.length }, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// exports.loginUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const user = await UsersModel.findByEmail(email);
//     if (!user) {
//       throw new AuthenticationError('Invalid email or password');
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       throw new AuthenticationError('Invalid email or password');
//     }

//     const token = jwt.sign(
//       { userId: user.id, email: user.email },
//       "a3f9b0e1a8c2d34e5f67b89a0c1d2e3f4a5b6c7d8e9f00112233445566778899",
//       { expiresIn: "1h" }
//       );

//       res.cookie("token", token, {
//         httpOnly: true,
//         secure: true,          
//         sameSite: "Lax",       
//         path: "/",             
//         maxAge: 60 * 60 * 1000
//       });

//     successResponse(res, {
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       },
//       token,
//     }, 'Login successful');
//   } catch (err) {
//     next(err);
//   }
// };

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AuthenticationError("Email and password are required");
    }

    let account = null;
    let role = null;

    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length > 0) {
      account = userResult.rows[0];
      role = "user";
    }

    if (!account) {
      const providerResult = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);
      if (providerResult.rows.length > 0) {
        account = providerResult.rows[0];
        role = "provider";
      }
    }

    if (!account) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      throw new AuthenticationError("Invalid email or password");
    }

    const token = jwt.sign(
      { id: account.id, email: account.email, role },
      "a3f9b0e1a8c2d34e5f67b89a0c1d2e3f4a5b6c7d8e9f00112233445566778899",
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    const redirectUrl =
      role === "provider"
        ? "/provider/dashboard"
        : "/user/dashboard";

    successResponse(
      res,
      {
        id: account.id,
        name: account.name,
        email: account.email,
        role,
        redirectUrl,
        token,
      },
      "Login successful"
    );
  } catch (err) {
    next(err);
  }
};


exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    successResponse(res, null, 'User deleted successfully');
    
  } catch (err) {
  
    next(new DatabaseError('Failed to delete user'));
  }
};



exports.add_project = async (req, res, next) => {
  try {
    const {
      title,
      notes,
      projectType,
      location,
      landSize,
      luxuryLevel,
      services,
      constructionBudget,
      basement,
      listingStyle
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required." });
    }

    if (!projectType) {
      return res.status(400).json({ error: "Project type is required." });
    }

    const project = await WorkModel.createMyProject({
      user_id: req.user.id,
      title,
      notes: notes || null,
      project_type: Number(projectType) || null,
      location: location || null,
      land_size: landSize || null,
      luxury_level: Number(luxuryLevel) || null,
      services: Number(services) || null,
      construction_budget: constructionBudget || null,
      basement: basement || null,
      listing_style: listingStyle || null,

      created_at: new Date(),
    });

    return successResponse(
      res,
      { project },
      "Project created successfully",
      201
    );

  } catch (err) {
    next(err);
  }
};


exports.getMyProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM work WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    next(err);
  }
};


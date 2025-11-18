const UsersModel = require('../models/usersModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { config } = require('../config/env');
const { successResponse, errorResponse } = require('../utils/response');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errors');
const { validateEmail } = require('../utils/validateEmail');
const pool = require("../db/pool");
const WorkModel = require('../models/workModel');
const { sendMail } = require('../config/mailer');
const multer = require("multer");
const path = require("path");

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

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { name, phone } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    const existingUser = await UsersModel.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profileImage) updateData.profile_image = profileImage;

    const updatedUser = await UsersModel.updateById(userId, updateData);

    return successResponse(
      res,
      { user: updatedUser },
      "Profile updated successfully",
      200
    );

  } catch (err) {
    next(err);
  }
};

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    }
  });

exports.upload = multer({ storage });


exports.getUsers = async (req, res, next) => {
  try {
    const users = await UsersModel.getAll();
    successResponse(res, { users, count: users.length }, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
};

exports.User = async (req, res, next) => {
  try {

    const userId = req.user.id;  

    const user = await UsersModel.findById(userId);

    if (!user) {

      return errorResponse(res, "User not found", 404);
    }

    successResponse(res, user, "Logged-in user retrieved successfully");
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

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    let account = null;
    let role = null;

    // Look inside users table
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length > 0) {
      account = userResult.rows[0];
      role = "user";
    }

    // Look inside providers table
    if (!account) {
      const providerResult = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);
      if (providerResult.rows.length > 0) {
        account = providerResult.rows[0];
        role = "provider";
      }
    }

    if (!account) {
      throw new NotFoundError("Email not found");
    }

    // Create reset token
    const resetToken = jwt.sign(
      { id: account.id, email: account.email, role },
      "a3f9b0e1a8c2d34e5f67b89a0c1d2e3f4a5b6c7d8e9f00112233445566778899",
      { expiresIn: "1h" }
    );

    // Same reset link structure you already use
    const resetLink = `https://hanois.dotwibe.com/login?reset-password=${resetToken}`;

    const html = `
      <div style="font-family: Arial; padding:20px;">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="
            display:inline-block;
            padding:12px 20px;
            background:#28a745;
            color:white;
            text-decoration:none;
            border-radius:5px;">
            Reset Password
        </a>
        <p>If the button doesn't work, use this link:</p>
        <p>${resetLink}</p>
      </div>
    `;

    await sendMail({
      to: email,
      subject: "Reset Your Password",
      html,
    });

    return res.json({ message: "Password reset link sent to your email" });

  } catch (err) {
    next(err);
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
      service_ids, 
      constructionBudget,
      basement,
      listingStyle,
      provider_id,
      build_area,
      cost_finsh,
      suggest_cost,
      total_cost,
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
      service_ids: service_ids || [],  
      construction_budget: constructionBudget || null,
      basement: basement || null,
      listing_style: listingStyle || null,
      provider_id: provider_id || [], 
      created_at: new Date(),
      build_area: build_area || null,
      cost_finsh: cost_finsh || null,
      suggest_cost: suggest_cost || null,
      total_cost: total_cost || null,
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
exports.getPublicProjects = async (req, res, next) => {
  try {
    // 1. Fetch all PUBLIC projects
    const result = await pool.query(
      "SELECT * FROM work WHERE listing_style = 'public' ORDER BY id DESC"
    );

    const projects = result.rows;

    if (!projects.length) {
      return res.json({ success: true, data: [] });
    }

    // 2. Extract ALL unique user_ids
    const userIds = [...new Set(projects.map(p => p.user_id).filter(Boolean))];

    // 3. Fetch users
    const users = await UsersModel.findByIds(userIds);
    const userMap = {};
    users.forEach(u => (userMap[u.id] = u));

    // 4. Fetch categories
    const { rows: categories } = await pool.query("SELECT * FROM categories");
    const categoryMap = {};
    categories.forEach(c => (categoryMap[c.id] = c));

    // 5. Fetch services
    const { rows: services } = await pool.query("SELECT * FROM services");
    const serviceMap = {};
    services.forEach(s => (serviceMap[s.id] = s));

    // 6. Fetch design (luxury levels)
    const { rows: designs } = await pool.query("SELECT * FROM design");
    const designMap = {};
    designs.forEach(d => (designMap[d.id] = d));

    // 7. Build final response
    const finalProjects = projects.map(p => ({
      ...p,
      user: userMap[p.user_id] || null,
      category: categoryMap[p.project_type] || null,
      service_list: p.service_ids ? p.service_ids.map(id => serviceMap[id]) : [],

      // ⭐ luxury level object instead of just ID
      luxury_level_details: designMap[p.luxury_level] || null,
    }));

    return res.json({ success: true, data: finalProjects });

  } catch (err) {
    next(err);
  }
};

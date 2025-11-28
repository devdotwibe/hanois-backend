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
const CommentsModel = require("../models/CommentsModel");
const LikesDislikesModel = require("../models/LikesDislikesModel");

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
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await UsersModel.findById(userId);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Compare plain current password with stored hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, "Current password is incorrect", 400);
    }

    // ❗ Do NOT hash here — model will handle hashing
    await UsersModel.updateById(userId, { password: newPassword });

    return successResponse(res, {}, "Password updated successfully");
  } catch (err) {
    next(err);
  }
};


exports.getMyProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Get all projects
    const workResult = await pool.query(
      "SELECT * FROM work WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    const projects = workResult.rows;

    if (projects.length === 0) {
      return res.json([]);
    }

    // 2️⃣ Collect project IDs
    const projectIds = projects.map(p => p.id);

    // 3️⃣ Get all proposals for these projects
    const proposalsResult = await pool.query(
      `
      SELECT * FROM proposals
      WHERE work_id = ANY($1)
      ORDER BY id DESC
      `,
      [projectIds]
    );

    const proposals = proposalsResult.rows;

    if (proposals.length === 0) {
      // Return projects with empty proposals
      return res.json(projects.map(p => ({ ...p, proposals: [] })));
    }

    // 4️⃣ Get all proposal IDs (to fetch attachments)
    const proposalIds = proposals.map(p => p.id);

    // 5️⃣ Get all attachments for these proposals
    const attachmentResult = await pool.query(
      `
      SELECT * FROM proposal_attachments
      WHERE proposal_id = ANY($1)
      ORDER BY id DESC
      `,
      [proposalIds]
    );

    const attachments = attachmentResult.rows;

    // 6️⃣ Attach attachments under each proposal
    const proposalsWithAttachments = proposals.map(proposal => ({
      ...proposal,
      attachments: attachments.filter(att => att.proposal_id === proposal.id)
    }));

    // 7️⃣ Attach proposals under each project
    const finalData = projects.map(project => ({
      ...project,
      proposals: proposalsWithAttachments.filter(
        proposal => proposal.work_id === project.id
      )
    }));

    return res.json(finalData);

  } catch (err) {
    next(err);
  }
};


// exports.getPublicProjects = async (req, res, next) => {
//   try {
//     // 1. Fetch all PUBLIC projects
//     const result = await pool.query(
//       "SELECT * FROM work WHERE listing_style = 'public' ORDER BY id DESC"
//     );

//     const projects = result.rows;

//     if (!projects.length) {
//       return res.json({ success: true, data: [] });
//     }

//     // 2. Extract ALL unique user_ids
//     const userIds = [...new Set(projects.map(p => p.user_id).filter(Boolean))];

//     // 3. Fetch users
//     const users = await UsersModel.findByIds(userIds);
//     const userMap = {};
//     users.forEach(u => (userMap[u.id] = u));

//     // 4. Fetch categories
//     const { rows: categories } = await pool.query("SELECT * FROM categories");
//     const categoryMap = {};
//     categories.forEach(c => (categoryMap[c.id] = c));

//     // 5. Fetch services
//     const { rows: services } = await pool.query("SELECT * FROM services");
//     const serviceMap = {};
//     services.forEach(s => (serviceMap[s.id] = s));

//     // 6. Fetch design (luxury levels)
//     const { rows: designs } = await pool.query("SELECT * FROM design");
//     const designMap = {};
//     designs.forEach(d => (designMap[d.id] = d));

//     // 7. Build final response
//     const finalProjects = projects.map(p => ({
//       ...p,
//       user: userMap[p.user_id] || null,
//       category: categoryMap[p.project_type] || null,
//       service_list: p.service_ids ? p.service_ids.map(id => serviceMap[id]) : [],

//       // ⭐ luxury level object instead of just ID
//       luxury_level_details: designMap[p.luxury_level] || null,
//     }));

//     return res.json({ success: true, data: finalProjects });

//   } catch (err) {
//     next(err);
//   }
// };

exports.getPublicProjects = async (req, res, next) => {
  try {
    const { search } = req.query;

    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8; 
    const offset = (page - 1) * limit;

    // 1. Fetch all PUBLIC projects COUNT for pagination
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM work WHERE listing_style = 'public'"
    );
    const total = parseInt(countResult.rows[0].count);

    // 2. Fetch only records for this page
    const result = await pool.query(
      "SELECT * FROM work WHERE listing_style = 'public' ORDER BY id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    let projects = result.rows;

    if (!projects.length) {
      return res.json({
        success: true,
        data: [],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    // 3. Extract user ids
    const userIds = [...new Set(projects.map(p => p.user_id).filter(Boolean))];

    // 4. Fetch related data
    const users = await UsersModel.findByIds(userIds);
    const userMap = {};
    users.forEach(u => (userMap[u.id] = u));

    const { rows: categories } = await pool.query("SELECT * FROM categories");
    const categoryMap = {};
    categories.forEach(c => (categoryMap[c.id] = c));

    const { rows: services } = await pool.query("SELECT * FROM services");
    const serviceMap = {};
    services.forEach(s => (serviceMap[s.id] = s));

    const { rows: designs } = await pool.query("SELECT * FROM design");
    const designMap = {};
    designs.forEach(d => (designMap[d.id] = d));

    // 5. Build final response
    let finalProjects = projects.map(p => ({
      ...p,
      user: userMap[p.user_id] || null,
      category: categoryMap[p.project_type] || null,
      service_list: p.service_ids ? p.service_ids.map(id => serviceMap[id]) : [],
      luxury_level_details: designMap[p.luxury_level] || null,
    }));

    // 6. Search filter
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      finalProjects = finalProjects.filter(p =>
        (p.title && p.title.toLowerCase().includes(searchLower)) ||
        (p.location && p.location.toLowerCase().includes(searchLower)) ||
        (p.user?.name && p.user.name.toLowerCase().includes(searchLower))
      );
    }

    return res.json({
      success: true,
      data: finalProjects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    next(err);
  }
};

exports.getPublicServices = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT service_ids FROM work WHERE listing_style = 'public'"
    );

    const uniqueServiceIds = [
      ...new Set(
        result.rows
          .map(row => row.service_ids)
          .filter(Boolean)
          .flat()
      )
    ];

    if (uniqueServiceIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const servicesResult = await pool.query(
      "SELECT id, name FROM services WHERE id = ANY($1)",
      [uniqueServiceIds]
    );

    return res.json({ success: true, data: servicesResult.rows });
  } catch (err) {
    next(err);
  }
};


exports.getProjectById = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // 1. Fetch project
    const { rows } = await pool.query(
      "SELECT * FROM work WHERE id = $1",
      [projectId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = rows[0];

    // 2. Fetch category
    const category = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [project.project_type]
    );

    // 3. Fetch luxury level
    const luxury = await pool.query(
      "SELECT * FROM design WHERE id = $1",
      [project.luxury_level]
    );

    // 4. Fetch services
    let service_list = [];
    if (project.service_ids?.length > 0) {
      const { rows } = await pool.query(
        `SELECT * FROM services WHERE id = ANY($1)`,
        [project.service_ids]
      );
      service_list = rows;
    }

    // 5. Fetch proposals
    const proposalsResult = await pool.query(
      `
      SELECT * FROM proposals
      WHERE work_id = $1
      ORDER BY created_at DESC
      `,
      [projectId]
    );

    const proposals = proposalsResult.rows;

    // 6. Fetch proposal attachments
    const proposalIds = proposals.map((p) => p.id);

    let attachments = [];
    if (proposalIds.length > 0) {
      const attachResult = await pool.query(
        `
        SELECT * FROM proposal_attachments
        WHERE proposal_id = ANY($1)
        ORDER BY created_at DESC
        `,
        [proposalIds]
      );
      attachments = attachResult.rows;
    }

    // 7. Fetch providers
    const providerIds = [
      ...new Set(
        proposals
          .map((p) => p.provider_id)
          .filter((id) => id !== null && id !== undefined)
      ),
    ];

    let providerMap = {};
    if (providerIds.length > 0) {
      const providersResult = await pool.query(
        `
        SELECT *
        FROM providers
        WHERE id = ANY($1)
        `,
        [providerIds]
      );

      providerMap = providersResult.rows.reduce((acc, provider) => {
        acc[provider.id] = provider;
        return acc;
      }, {});
    }

    // 8. Merge attachments and provider into proposals
    const proposalsWithAttachments = proposals.map((proposal) => ({
      ...proposal,
      attachments: attachments.filter(
        (a) => a.proposal_id === proposal.id
      ),
      provider: providerMap[proposal.provider_id] || null,
    }));

    /* ===========================================================
       9. LOAD COMMENTS + LIKES + DISLIKES + MY REACTION
       =========================================================== */

    // Get nested comments
    let comments = await CommentsModel.getForProject(projectId);

    // Determine identity of logged in user
    let user_id = null;
    let provider_id = null;

    if (req.user?.role === "user") user_id = req.user.id;
    if (req.user?.role === "provider") provider_id = req.user.id;

    // Helper to attach reaction info
    async function enrichComments(list) {
      for (let c of list) {
        const counts = await LikesDislikesModel.countReactions(c.id);
        const my = await LikesDislikesModel.findReaction({
          user_id,
          provider_id,
          comment_id: c.id,
        });

        c.likes = Number(counts.likes) || 0;
        c.dislikes = Number(counts.dislikes) || 0;
        c.myReaction = my ? my.type : null;

        if (c.replies?.length > 0) {
          await enrichComments(c.replies);
        }
      }
      return list;
    }

    comments = await enrichComments(comments);

    /* ===========================================================
       10. SEND FINAL RESPONSE
       =========================================================== */

    return res.json({
      success: true,
      data: {
        project: {
          ...project,
          category: category.rows[0] || null,
          luxury_level_details: luxury.rows[0] || null,
          service_list,
          proposals: proposalsWithAttachments,
          comments: comments,
          comments_count: comments.length,
        },
      },
    });

  } catch (err) {
    next(err);
  }
};





exports.updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    let fields = req.body;

    // 🔥 Fix incoming keys from frontend to match DB columns
    const keyMap = {
      projectType: "project_type",
      landSize: "land_size",
      luxuryLevel: "luxury_level",
      services: "service_ids",
      service_ids: "service_ids",
      constructionBudget: "construction_budget",
      listingStyle: "listing_style",
    };

    Object.keys(fields).forEach((key) => {
      if (keyMap[key]) {
        fields[keyMap[key]] = fields[key];
        delete fields[key];
      }
    });

    // 🔥 FIX: Convert JS array → PostgreSQL array format for service_ids
    if (Array.isArray(fields.service_ids)) {
      fields.service_ids = `{${fields.service_ids.join(",")}}`;
    }

    // 🔥 REMOVE all non-table fields (IMPORTANT)
    delete fields.category;
    delete fields.luxury_level_details;
    delete fields.service_list;
    delete fields.user;
    delete fields.created_at;
    delete fields.id;
    delete fields.status;

    // Stop if nothing left
    if (!fields || Object.keys(fields).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields provided for update.",
      });
    }

    // Build SQL dynamically
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setQuery = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const updateQuery = `
      UPDATE work 
      SET ${setQuery}
      WHERE id = ${projectId}
      RETURNING *
    `;

    const updated = await pool.query(updateQuery, values);

    if (!updated.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const project = updated.rows[0];

    // Fetch relations again
    const category = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [project.project_type]
    );

    const luxury = await pool.query(
      "SELECT * FROM design WHERE id = $1",
      [project.luxury_level]
    );

    let service_list = [];
    if (project.service_ids?.length > 0) {
      const { rows } = await pool.query(
        `SELECT * FROM services WHERE id = ANY($1)`,
        [project.service_ids]
      );
      service_list = rows;
    }

    return res.json({
      success: true,
      message: "Project updated successfully",
      data: {
        project: {
          ...project,
          category: category.rows[0] || null,
          luxury_level_details: luxury.rows[0] || null,
          service_list,
        },
      },
    });

  } catch (err) {
    next(err);
  }
};

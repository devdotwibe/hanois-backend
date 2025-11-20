const ProviderModel = require('../models/providerModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { successResponse, errorResponse } = require('../utils/response');
const { ValidationError,DatabaseError, AuthenticationError, ConflictError } = require('../utils/errors');
const { config } = require('../config/env');
const { sendMail } = require('../config/mailer');
const { validateEmail } = require('../utils/validateEmail');
const pool = require("../db/pool");
const JWT_SECRET = "a3f9b0e1a8c2d34e5f67b89a0c1d2e3f4a5b6c7d8e9f00112233445566778899";
const UsersModel = require('../models/usersModel');

const LeadsModel = require('../models/LeadsModel');

const ProposalsModel = require("../models/proposalsModel");
const ProposalAttachmentsModel = require("../models/ProposalAttachmentsModel");


const fs = require("fs");
const path = require("path");

  exports.resetPassword = async (req, res, next) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return errorResponse(res, "Missing token or password", 400);
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return errorResponse(res, "Invalid or expired token", 400);
      }

      // Support BOTH token types:
      // 1. registration: { providerId }
      // 2. forgot-password: { id, role: "provider" }

      let providerId = decoded.providerId || null;

      if (!providerId && decoded.role === "provider") {
        providerId = decoded.id;
      }

      let userId = null;
      if (decoded.role === "user") {
        userId = decoded.id;
      }



      if (!providerId && !userId) {
        return errorResponse(res, "Invalid token", 400);
      }


      const hashedPassword = await bcrypt.hash(password, 10);

      // Update provider table
      await pool.query(
        "UPDATE providers SET password = $1 WHERE id = $2",
        [hashedPassword, providerId]
      );
      
      if (userId) {
        await pool.query(
          "UPDATE users SET password = $1 WHERE id = $2",
          [hashedPassword, userId]
        );
      }

      return successResponse(res, {}, "Password reset successful");
    } catch (err) {
      next(err);
    }
  };


exports.getProvidersByCategory = async (req, res) => {

    try {
      const { categoryId } = req.params;

      const result = await pool.query(
        `SELECT * FROM providers WHERE $1 = ANY(categories_id)`,
        [parseInt(categoryId)]
      );

      res.status(200).json(result.rows);

    } catch (error) {
      
      console.error("Error fetching providers:", error);
      res.status(500).json({ message: "Server error while fetching providers" });
    }
};

exports.registerProvider = async (req, res, next) => {
  try {
    const { name, email, phone, register_no, password, location, team_size, service, website, social_media } = req.body;


    const emailCheck = await validateEmail(email);

    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.message });
    }

    const existingProvider = await ProviderModel.findByEmail(email);
    if (existingProvider) {
      throw new ConflictError('Email already registered');
    }

     const plainPassword = password || '12345678';

    const hashedPassword =  await bcrypt.hash(plainPassword.toString(), 10);

    const provider = await ProviderModel.create({
      name,
      email,
      phone,
      register_no,
      password: hashedPassword,
      location,
      team_size,
      service,
      website,
      social_media,
    });


        const resetToken = jwt.sign(
        { providerId: provider.id, email: provider.email },
        "a3f9b0e1a8c2d34e5f67b89a0c1d2e3f4a5b6c7d8e9f00112233445566778899",
        { expiresIn: "1h" }
        );

        const resetLink = `${
             "https://hanois.dotwibe.com"
        }/login?reset-password=${resetToken}`;

           const registrationHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                <h2 style="color: #28a745;">Success!</h2>
                <p>
                Thank you for registering at <b>Hands</b>. The verification process
                might take some time. You will receive an email once approved.
                </p>
                <hr style="margin: 20px 0;" />
                <p><strong>Registered Email:</strong> ${email}</p>
                <p><strong>Business Name:</strong> ${name}</p>
                <br/>
                <p>If you wish to set or reset your password, click the button below:</p>

                <div style="margin-top: 20px; text-align: center;">
                <a href="${resetLink}"
                    style="
                    display: inline-block;
                    background-color: #28a745;
                    color: #ffffff;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    ">
                    Set Your Password
                </a>
                </div>

                <p style="margin-top: 30px;">
                If the button above doesn’t work, copy and paste this link:
                <br/>
                <a href="${resetLink}" style="color: #007bff;">${resetLink}</a>
                </p>

                <br/>
                <p>Best regards,<br><strong>${config.mail.fromName || "Hands Support Team"}</strong></p>
            </div>
            `;

        await sendMail({
        to: email,
        subject: "Registration Successful - Hands Provider",
        html: registrationHtml,
        });

    successResponse(
      res,
      { provider },
      'Provider registered successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

exports.loginProvider = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const provider = await ProviderModel.findByEmail(email);
    if (!provider) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    const token = jwt.sign(
      { providerId: provider.id, email: provider.email },

      "a3f9b0e1a8c2d34e5f67b89a0c1d2e3f4a5b6c7d8e9f00112233445566778899",

      { expiresIn: "1h" }
    );

    successResponse(
      res,
      {
        provider: {
          id: provider.id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          service: provider.service
        },
        token
      },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
};

exports.getProviders = async (req, res, next) => {
  try {
    const { category, name, service } = req.query;  // Extract category, name, and service filters from query params
    
    let providers;
    
    // If category is provided, filter providers by category
    if (category) {
      providers = await ProviderModel.getByCategory(category);
    } else {
      // Otherwise, fetch all providers
      providers = await ProviderModel.getAll();
    }

    // If name filter is provided, filter providers by name
    if (name) {
      providers = providers.filter(provider =>
        provider.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    // If service filter is provided, filter providers by service
    if (service) {
      providers = providers.filter(provider =>
        provider.service.toLowerCase().includes(service.toLowerCase())
      );
    }

    // Return the filtered results
    successResponse(res, { providers, count: providers.length }, 'Providers retrieved successfully');
  } catch (err) {
    next(err);
  }
};



exports.deleteProvider = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if provider exists
    const userResult = await pool.query('SELECT * FROM providers WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
    }

    await pool.query('DELETE FROM providers WHERE id = $1', [id]);

    return res.json({
      success: true,
      message: 'Provider deleted successfully',
    });

  } catch (err) {
    console.error('Delete provider error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete provider',
      details: err.message,
    });
  }
};

exports.getProviderById = async (req, res, next) => {
  try {
    const providerId = req.params.id;
    const provider = await ProviderModel.findById(providerId);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    res.json({ provider });
  } catch (err) {
    next(err);
  }
};




exports.updateProvider = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const providerId = req.params.id;
    if (!providerId) return errorResponse(res, "Provider ID is required", 400);

    const {
      name,
      email,
      phone,
      password,
      location,
      team_size,
      service,
      website,
      social_media,
      categories_id,
      service_id,        // optional array of service ids (strings or numbers)
      service_details,   // optional array of { id | service_id, cost|average_cost, currency, note|service_note }
      notes,
      facebook,
      instagram,
      other_link,
    } = req.body;

    // Start transaction
    await client.query("BEGIN");

    // 1) Update providers table using existing model function
    const updatedProvider = await ProviderModel.updateById(providerId, {
      name,
      email,
      phone,
      password,
      location,
      team_size,
      service,
      website,
      social_media,
      categories_id,
      service_id,
      notes,
      facebook,
      instagram,
      other_link
    });

    if (!updatedProvider) {
      // nothing updated or provider not found
      await client.query("ROLLBACK");
      return errorResponse(res, "Nothing to update or provider not found", 404);
    }

    // 2) If service_details is provided, upsert into provider_services
    if (Array.isArray(service_details) && service_details.length > 0) {
      for (const item of service_details) {
        // accept either item.id or item.service_id
        const rawServiceId = item.id ?? item.service_id;
        const serviceId = Number(rawServiceId);
        if (!serviceId || Number.isNaN(serviceId)) {
          // skip invalid service id
          console.warn(`Skipping invalid service id: ${rawServiceId}`);
          continue;
        }

        // Normalise numeric cost (or null)
        const rawCost = item.cost ?? item.average_cost ?? null;
        const average_cost = rawCost !== undefined && rawCost !== null && rawCost !== "" ? Number(rawCost) : null;

        const currency = (item.currency || item.curr || "KD")?.toString() ?? "KD";

        // try UPDATE first
      const updateRes = await client.query(
        `UPDATE provider_services
        SET average_cost = $1,
            currency = $2,
            updated_at = NOW()
        WHERE provider_id = $3 AND service_id = $4
        RETURNING id`,
        [average_cost, currency, providerId, serviceId]
      );

      if (updateRes.rowCount === 0) {
        // INSERT without service_note
        await client.query(
          `INSERT INTO provider_services
          (provider_id, service_id, average_cost, currency, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [providerId, serviceId, average_cost, currency]
        );
      }
      }
    }

    // 3) Optional: if frontend sent a service_id array and you want to remove provider_services not in that list
    // (uncomment the block below if you want that behavior)
    if (Array.isArray(service_id)) {
      // build list of integer ids
      const keepIds = service_id
        .map((s) => Number(s))
        .filter((n) => !Number.isNaN(n));
      if (keepIds.length > 0) {
        // delete rows for this provider not included in keepIds
        const placeholders = keepIds.map((_, i) => `$${i + 2}`).join(',');
        // query args: [providerId, ...keepIds]
        await client.query(
          `DELETE FROM provider_services
           WHERE provider_id = $1
             AND service_id NOT IN (${placeholders})`,
          [providerId, ...keepIds]
        );
      } else {
        // if empty array provided, delete all provider services for this provider
        await client.query(
          `DELETE FROM provider_services WHERE provider_id = $1`,
          [providerId]
        );
      }
    }

    // Commit everything
    await client.query("COMMIT");

    // You can optionally fetch the latest provider row to return
    const latestProvider = await ProviderModel.findById(providerId);

    successResponse(res, { provider: latestProvider }, "Provider updated successfully");
  } catch (err) {
    // Rollback on error
    try { await client.query("ROLLBACK"); } catch (e) { console.error("Rollback failed:", e); }
    next(err);
  } finally {
    client.release();
  }
};




const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); 
    const fileName = Date.now() + ext; 
    cb(null, fileName); 
  }
});

const upload = multer({ storage: storage });

exports.updateProviderProfile = [
  upload.single('image'),
  async (req, res, next) => {
    try {
      const providerId = req.params.providerId;
      const { professional_headline } = req.body;

      if (!providerId) {
        return res.status(400).json({ error: 'Provider ID is required in URL' });
      }

      // Build the update object only with fields that were actually provided.
      const updateData = {};

      // If a file was uploaded, set the image path.
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`; // <-- fixed backticks
      } else if (Object.prototype.hasOwnProperty.call(req.body, 'image')) {
        // If the client explicitly sent "image" (could be `null` to remove)
        // include it so the client can remove the image via JSON payload.
        // Note: when using multipart/form-data, req.body.image may be a string.
        updateData.image = req.body.image === 'null' ? null : req.body.image;
      }

      // Always allow updating professional_headline if provided
      if (typeof professional_headline !== 'undefined') {
        updateData.professional_headline = professional_headline;
      }

      // If nothing to update, return current row
      const updatedProvider = await ProviderModel.updateProfile(providerId, updateData);

      return successResponse(res, { provider: updatedProvider }, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
];




// 🔍 Fetch all provider_services (for debugging / testing, no auth required)
exports.getAllProviderServices = async (req, res, next) => {
  try {
    const { providerId, serviceId } = req.query; // optional query filters

    let query = `
      SELECT 
        ps.id,
        ps.provider_id,
        p.name AS provider_name,
        ps.service_id,
        s.name AS service_name,
        ps.average_cost,
        ps.currency,
        ps.created_at,
        ps.updated_at
      FROM provider_services ps
      LEFT JOIN providers p ON ps.provider_id = p.id
      LEFT JOIN services s ON ps.service_id = s.id
    `;

    const params = [];
    const conditions = [];

    if (providerId) {
      params.push(providerId);
      conditions.push(`ps.provider_id = $${params.length}`);
    }

    if (serviceId) {
      params.push(serviceId);
      conditions.push(`ps.service_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY ps.created_at DESC";

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching provider_services:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch provider_services",
      details: err.message,
    });
  }
};
exports.getLeads = async (req, res) => {
  try {
    const providerId = req.user?.id;

    if (!providerId) {
      return res.status(400).json({ success: false, error: "Provider ID not found" });
    }

    // 1️⃣ System Leads (work table)
    const workQuery = `
      SELECT *,
      created_at AS system_created_at
      FROM work
      WHERE $1 = ANY(provider_id)
    `;
    const { rows: systemLeads } = await pool.query(workQuery, [providerId]);

    // 2️⃣ Manual Leads (leads + work join)
const manualLeadQuery = `
  SELECT 
    w.*,
    l.id AS lead_id,
    l.status AS lead_status,
    l.description AS lead_description,
    l.created_at AS lead_created_at,

    -- 🚀 proposal fields added
    p.id AS proposal_id,
    p.status AS proposal_status

  FROM leads l
  JOIN work w ON w.id = l.work_id
  LEFT JOIN proposals p 
      ON p.work_id = w.id 
      AND p.provider_id = $1

  WHERE l.provider_id = $1
`;

    const { rows: manualLeads } = await pool.query(manualLeadQuery, [providerId]);

    // 3️⃣ Merge without overwriting work table fields
    const map = new Map();

    // → First insert system leads
    systemLeads.forEach(sys => map.set(sys.id, { ...sys, lead_id: null }));

    // → Then insert manual leads (adds lead fields)
    manualLeads.forEach(man => map.set(man.id, { ...map.get(man.id), ...man }));

    const allLeads = Array.from(map.values());

    if (allLeads.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 4️⃣ Sort (latest first)
    allLeads.sort((a, b) => {
      const A = a.lead_created_at || a.system_created_at || a.created_at;
      const B = b.lead_created_at || b.system_created_at || b.created_at;
      return new Date(B) - new Date(A);
    });

    // 5️⃣ Load related tables
    const userIds = [...new Set(allLeads.map(w => w.user_id).filter(Boolean))];
    const users = await UsersModel.findByIds(userIds);
    const userMap = {};
    users.forEach(u => (userMap[u.id] = u));

    const { rows: categories } = await pool.query("SELECT * FROM categories");
    const categoryMap = {};
    categories.forEach(c => (categoryMap[c.id] = c));

    const { rows: designList } = await pool.query("SELECT * FROM design");
    const designMap = {};
    designList.forEach(d => (designMap[d.id] = d));

    // 6️⃣ Build final response
    const finalList = allLeads.map(w => ({
      ...w,

      // Attach user & category
      user: userMap[w.user_id] || null,
      category: categoryMap[w.project_type] || null,

      // Manual lead fields
      lead_id: w.lead_id || null,
    status: w.status,   
      proposal_note: w.lead_description ?? "",
      lead_created_at: w.lead_created_at || null,


        proposal_id: w.proposal_id || null,
  proposal_status: w.proposal_status || null,


      // Luxury type
      luxury_level: w.luxury_level,
      luxury_level_details: designMap[w.luxury_level] || null,
      luxury_type: designMap[w.luxury_level]?.name || null,

      // Lead source
      lead_source: w.lead_id ? "manual" : "system"
    }));

    return res.json({ success: true, data: finalList });

  } catch (err) {
    console.error("Error in getLeads:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


exports.addLead = async (req, res) => {
  try {
    const providerId = req.user?.id;
    const { work_id } = req.body;

    if (!providerId) {
      return res.status(400).json({ success: false, error: "Provider ID missing" });
    }

    if (!work_id) {
      return res.status(400).json({ success: false, error: "work_id is required" });
    }

    // Check existing
    const existing = await LeadsModel.checkExistingLead(work_id, providerId);

    if (existing) {
      return res.json({
        success: true,
        message: "Already added to leads",
        lead: existing
      });
    }

    // Create new lead
    const lead = await LeadsModel.createLead({
      work_id,
      provider_id: providerId
    });

    return res.json({
      success: true,
      message: "Added to leads successfully",
      lead
    });

  } catch (err) {
    console.error("Error adding lead:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
exports.getLeadWorkIds = async (req, res) => {
  try {
    const providerId = req.user?.id;

    const result = await pool.query(
      "SELECT work_id FROM leads WHERE provider_id = $1",
      [providerId]
    );

    const workIds = result.rows.map(r => r.work_id);

    return res.json({
      success: true,
      workIds
    });

  } catch (err) {
    console.error("Error fetching lead work IDs:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};exports.updateLead = async (req, res) => {
  try {
    const providerId = req.user?.id;
    const { lead_id, work_id, status, description } = req.body;

    console.log("📥 Incoming Update Payload:", {
      providerId,
      lead_id,
      work_id,
      status,
      description
    });

    if (!providerId) {
      return res.status(400).json({ success: false, error: "Provider ID not found" });
    }

    if (!lead_id && !work_id) {
      return res.status(400).json({ success: false, error: "Either lead_id or work_id is required" });
    }

    let result;

    // ✅ Update by lead_id
    if (lead_id) {
      result = await pool.query(
        `
        UPDATE leads
        SET status = $1,
            description = $2
        WHERE id = $3 AND provider_id = $4
        RETURNING *;
        `,
        [status, description, lead_id, providerId]
      );
    } 
    // ✅ Update by work_id
    else {
      result = await pool.query(
        `
        UPDATE leads
        SET status = $1,
            description = $2
        WHERE work_id = $3 AND provider_id = $4
        RETURNING *;
        `,
        [status, description, work_id, providerId]
      );
    }

    if (result.rowCount === 0) {
      return res.json({ success: false, message: "Lead not found" });
    }

    return res.json({
      success: true,
      message: "Lead updated successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("❌ ERROR updating lead:");
    console.error("Message:", err.message);
    console.error("Detail:", err.detail);
    console.error("Hint:", err.hint);
    console.error("Position:", err.position);
    console.error("Where:", err.where);
    console.error("Code:", err.code);
    console.error("SQL State:", err.sqlState);
    console.error("Stack:", err.stack);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: err.message,
      detail: err.detail
    });
  }
};

exports.createProposal = async (req, res, next) => {
  try {
    const provider_id = req.user?.id; // provider logged in

    // READ TEXT FIELDS
    const {
      user_id,
      work_id,
      title,
      budget,
      timeline,
      description
    } = req.body;

    // READ MULTIPLE FILES (stored by multer)
    const files = req.files || [];

    if (!provider_id || !user_id || !work_id) {
      return errorResponse(res, "Missing required fields", 400);
    }

    // Prevent duplicate proposal for same provider + work
    const exists = await ProposalsModel.checkExisting(provider_id, work_id);
    if (exists) {
      return errorResponse(res, "Proposal already submitted for this project", 409);
    }

    // SAVE BASE PROPOSAL (NO attachment here)
    const newProposal = await ProposalsModel.createProposal({
      user_id,
      provider_id,
      work_id,
      title,
      budget,
      timeline,
      description,
      attachment: null // no single attachment anymore
    });

    // SAVE MULTIPLE ATTACHMENTS INTO proposal_attachments TABLE
    for (const file of files) {
      await ProposalAttachmentsModel.addAttachment(newProposal.id, file.filename);
    }

    return successResponse(res, newProposal, "Proposal sent successfully");

  } catch (err) {
    console.error("❌ Create Proposal Error:", err);
    next(err);
  }
};

exports.getProposalById = async (req, res, next) => {
  try {
    const proposal_id = req.params.id;

    if (!proposal_id) {
      return errorResponse(res, "Proposal ID is required", 400);
    }

    // Fetch proposal from main table
    const proposal = await ProposalsModel.getById(proposal_id);

    if (!proposal) {
      return errorResponse(res, "Proposal not found", 404);
    }

    // Fetch user info
    const user = await UsersModel.findById(proposal.user_id);

    // Fetch attachments
    const attachments = await ProposalAttachmentsModel.getAttachments(proposal_id);

    return successResponse(
      res,
      {
        ...proposal,
        user: user || null,
        attachments: attachments || []
      },
      "Proposal retrieved successfully"
    );

  } catch (err) {
    console.error("Error in getProposalById:", err);
    next(err);
  }
};

exports.updateProposal = async (req, res, next) => {
  try {
    const proposalId = req.params.id;
    const provider_id = req.user.id;

    const { title, budget, timeline, description } = req.body;

    // Check if proposal belongs to provider
    const check = await pool.query(
      `SELECT * FROM proposals WHERE id = $1 AND provider_id = $2`,
      [proposalId, provider_id]
    );

    if (check.rows.length === 0) {
      return errorResponse(res, "Proposal not found or not owned by you", 404);
    }

    // Update proposal fields (NO attachment here anymore)
    await pool.query(
      `
      UPDATE proposals
      SET 
        title = $1,
        budget = $2,
        timeline = $3,
        description = $4
      WHERE id = $5 AND provider_id = $6
      `,
      [title, budget, timeline, description, proposalId, provider_id]
    );

    // Save new MULTIPLE attachments (if any)
    const files = req.files || [];
    for (const file of files) {
      await ProposalAttachmentsModel.addAttachment(proposalId, file.filename);
    }

    return successResponse(res, null, "Proposal updated successfully");

  } catch (error) {
    console.error("🔥 Update Proposal Error:", error);
    return errorResponse(res, error.message || "Internal server error", 500);
  }
};


exports.deleteProposalAttachment = async (req, res, next) => {
  try {
    const attachmentId = req.params.id;
    const provider_id = req.user?.id;

    if (!attachmentId) {
      return errorResponse(res, "Attachment ID is required", 400);
    }

    // 1️⃣ Get attachment details
    const attachment = await ProposalAttachmentsModel.getAttachmentById(attachmentId);

    if (!attachment) {
      return errorResponse(res, "Attachment not found", 404);
    }

    // 2️⃣ Check if this proposal belongs to logged-in provider
    const proposal = await ProposalsModel.getById(attachment.proposal_id);

    if (!proposal || proposal.provider_id !== provider_id) {
      return errorResponse(res, "Not authorized to delete this file", 403);
    }

    // 3️⃣ Delete DB record
    await ProposalAttachmentsModel.deleteAttachment(attachmentId);

    // 4️⃣ Delete file from storage
    const filePath = path.join(__dirname, "../public/proposals", attachment.attachment);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return successResponse(res, null, "Attachment removed successfully");

  } catch (error) {
    console.error("🔥 Delete Proposal Attachment Error:", error);
    return errorResponse(res, error.message || "Internal server error", 500);
  }
};
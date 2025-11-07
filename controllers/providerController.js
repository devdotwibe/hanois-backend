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

    const providerId = decoded.providerId;
    const hashedPassword = await bcrypt.hash(password, 10);

    await ProviderModel.updatePassword(providerId, hashedPassword);

    successResponse(res, {}, "Password reset successful");
  } catch (err) {
    next(err);
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
      social_media
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
                    Reset Password
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
    const providers = await ProviderModel.getAll();
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
  try {
    const providerId = req.params.id;
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
      service_id,
      notes,
      facebook,
      instagram,
      other_link
    } = req.body;

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
      return errorResponse(res, "Nothing to update or provider not found", 404);
    }

    successResponse(res, { provider: updatedProvider }, "Provider updated successfully");
  } catch (err) {
    next(err);
  }
};



// controller (e.g. providerController.js)
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

exports.updateProviderProfile = [
  upload.single('image'),
  async (req, res, next) => {
    try {
      // Prefer explicit route param first (safe for admins editing others),
      // fall back to authenticated user's id if param not present.
      const providerId = req.params.providerId || (req.user && req.user.id);
      if (!providerId) {
        return res.status(400).json({ error: 'Provider ID not found' });
      }

      // OPTIONAL: enforce that a non-admin can only update their own profile.
      // Uncomment and adapt role check if you have roles in req.user:
      /*
      if (req.user && req.user.role !== 'admin' && req.params.providerId && String(req.user.id) !== String(req.params.providerId)) {
        return res.status(403).json({ error: 'Forbidden: cannot update other provider profiles' });
      }
      */

      const { professional_headline } = req.body;

      // Build update object conditionally
      const updateData = {};
      if (typeof professional_headline !== 'undefined') {
        updateData.professional_headline = professional_headline;
      }
      if (req.file) {
        // Save path relative to public served folder
        updateData.image = `/uploads/${req.file.filename}`;
      }

      // If nothing to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No data provided to update' });
      }

      const updatedProvider = await ProviderModel.updateProfile(providerId, updateData);

      return successResponse(res, { provider: updatedProvider }, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
];

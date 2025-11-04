const ProviderModel = require('../models/providerModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { successResponse, errorResponse } = require('../utils/response');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errors');
const { config } = require('../config/env');

exports.registerProvider = async (req, res, next) => {
  try {
    const { name, email, phone, register_no, password, location, team_size, service, website, social_media } = req.body;

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

      
    //    const registrationHtml = `
    //     <div style="font-family: Arial, sans-serif; padding: 20px;">
    //         <h2 style="color: #28a745;">Success!</h2>
    //         <p>
    //         Thank you for registering at <b>Hands</b>. Verification process
    //         might take some time. You will receive an email once approved.
    //         </p>
    //         <hr />
    //         <p><strong>Registered Email:</strong> ${email}</p>
    //         <p><strong>Business Name:</strong> ${name}</p>
    //         <br/>
    //         <p>Best regards,<br><strong>${config.mail.fromName || "Hands Support Team"}</strong></p>
    //     </div>
    //     `;

    //     await sendMail({
    //     to: email,
    //     subject: "Registration Successful - Hands Provider",
    //     html: registrationHtml,
    //     });

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

const ContactsModel = require('../models/ContactsModel');
const { successResponse } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { sendMail } = require('../config/mailer');
const { config } = require('../config/env');

// 🟩 Create new contact + send email
exports.createContact = async (req, res, next) => {
  try {
    const { full_name, business_email, company_name, website_url, notes } = req.body;

    if (!full_name || !business_email) {
      throw new ValidationError('Full name and business email are required');
    }

    // ✅ Save to DB
    const contact = await ContactsModel.create({
      full_name,
      business_email,
      company_name: company_name || null,
      website_url: website_url || null,
      notes: notes || null,
    });

    // 📨 Send email to admin
   const adminEmail = config.mail.adminEmail;

    console.log("📮 Sending admin email to:", adminEmail);
    const adminEmailHtml = `
      <h2>New Contact Submission</h2>
      <p><strong>Full Name:</strong> ${full_name}</p>
      <p><strong>Email:</strong> ${business_email}</p>
      <p><strong>Company:</strong> ${company_name || '-'}</p>
      <p><strong>Website:</strong> ${website_url || '-'}</p>
      <p><strong>Notes:</strong> ${notes || '-'}</p>
      <hr />
      <p>Submitted on: ${new Date().toLocaleString()}</p>
    `;

    await sendMail({
      to: adminEmail,
      subject: `New Contact Form Submission from ${full_name}`,
      html: adminEmailHtml,
    });

    // 📨 Optional: Send auto-reply to user
    const userReplyHtml = `
      <p>Hi ${full_name},</p>
      <p>Thank you for reaching out to us. We’ve received your message and will get back to you shortly.</p>
      <br/>
      <p>Best regards,<br><strong>${config.mail.fromName || 'Support Team'}</strong></p>
    `;

    await sendMail({
      to: business_email,
      subject: 'Thank you for contacting us!',
      html: userReplyHtml,
    });

    // ✅ Response
    successResponse(res, { contact }, 'Message sent successfully and email notifications triggered!', 201);
  } catch (err) {
    next(err);
  }
};

// 🟩 Get all contacts
exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await ContactsModel.getAll();
    successResponse(res, { contacts, count: contacts.length }, 'Contacts retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// 🟩 Get contact by ID
exports.getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await ContactsModel.findById(id);

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    successResponse(res, { contact }, 'Contact retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// 🟩 Update contact
exports.updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await ContactsModel.updateById(id, req.body);

    if (!contact) {
      throw new NotFoundError('Contact not found or not updated');
    }

    successResponse(res, { contact }, 'Contact updated successfully');
  } catch (err) {
    next(err);
  }
};

// 🟩 Delete contact
exports.deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ContactsModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundError('Contact not found or already deleted');
    }

    successResponse(res, { id: deleted.id }, 'Contact deleted successfully');
  } catch (err) {
    next(err);
  }
};

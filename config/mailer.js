const nodemailer = require('nodemailer');
const { config } = require('./env');

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: true, // true for 465 (SSL), false for others
  auth: {
    user: config.mail.username,
    pass: config.mail.password,
  },
});

async function sendMail({ to, subject, html, from }) {
  try {
    const mailOptions = {
      from: from || `"${config.mail.fromName}" <${config.mail.fromAddress}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}`);
  } catch (err) {
    console.error('❌ Email send error:', err.message);
  }
}

module.exports = { sendMail };

const AdminsModel = require("../models/adminsModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { config } = require("../config/env");

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await AdminsModel.findByEmail(email);

    if (!admin) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || "a3f9b0e1a8c2d34e5f67b89a0c1d2e3f4a5b6c7d8e9f00112233445566778899",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.json({
      success: true,
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

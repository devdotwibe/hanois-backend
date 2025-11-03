const AdminsModel = require("../models/adminsModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { config } = require("../config/env");
const { successResponse, errorResponse } = require("../utils/response");
const { AuthenticationError } = require("../utils/errors");

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await AdminsModel.getAll();
    successResponse(res, { admins, count: admins.length }, "Admins fetched");
  } catch (err) {
    next(err);
  }
};

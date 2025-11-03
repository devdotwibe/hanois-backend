const AdminsModel = require("../models/adminsModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { config } = require("../config/env");
const { successResponse, errorResponse } = require("../utils/response");
const { AuthenticationError } = require("../utils/errors");

exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminsModel.findByEmail(email);
    if (!admin) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new AuthenticationError("Invalid email or password");
    }

    // const token = jwt.sign(
    //   { adminId: admin.id, email: admin.email },
    //   config.jwt.secret,
    //   { expiresIn: config.jwt.expiresIn }
    // );

    const token = jwt.sign(
    { adminId: admin.id, email: admin.email },
    "a3f9b0e1a8c2d34e5f67b89a0c1d2e3f4a5b6c7d8e9f00112233445566778899",
    { expiresIn: "1h" }
    );

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: config.nodeEnv === "production",
    //   sameSite: "lax",
    //   path: "/", 
    //   maxAge: 60 * 60 * 1000, 
    // });

    // res.cookie("token", token, {
    //     httpOnly: true,
    //     secure: false, 
    //     sameSite: "lax", 
    //     path: "/",
    //     maxAge: 60 * 60 * 1000, 
    // });

    res.cookie("token", token, {
    httpOnly: true,
    secure: true,          
    sameSite: "Lax",       
    path: "/",             
    maxAge: 60 * 60 * 1000
    });



    successResponse(
      res,
      {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      },
      "Login successful"
    );
  } catch (err) {
    next(err);
  }
};


exports.logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
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

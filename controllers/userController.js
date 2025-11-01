const UsersModel = require('../models/usersModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { config } = require('../config/env');
const { successResponse, errorResponse } = require('../utils/response');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errors');

exports.registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const existingUser = await UsersModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

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

exports.getUsers = async (req, res, next) => {
  try {
    const users = await UsersModel.getAll();
    successResponse(res, { users, count: users.length }, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UsersModel.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};
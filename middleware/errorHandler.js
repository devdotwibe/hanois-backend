const { config } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.code === '23505') {
    statusCode = 409;
    const field = err.detail?.match(/Key \((\w+)\)/)?.[1] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced resource does not exist';
  }

  if (err.code === '22P02') {
    statusCode = 400;
    message = 'Invalid data format';
  }

  const response = {
    success: false,
    error: message,
  };

  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
    response.details = err.details;
  }

  console.error('Error:', {
    message: err.message,
    statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json(response);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFoundHandler };

const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access token is required' 
    });
  }

   req.user = user;
   next();

  // jwt.verify(token, config.jwt.secret, (err, user) => {
  //   // if (err) {
  //   //   return res.status(403).json({ 
  //   //     success: false,
  //   //     error: 'Invalid or expired token' 
  //   //   });
  //   // }
  //   req.user = user;
  //   next();
  // });

    // next();

};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (!err) {
      req.user = user;
    }
    next();
  });
};

module.exports = { authenticateToken, optionalAuth };

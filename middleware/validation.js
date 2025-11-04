const { 
  validateEmail, 
  validatePassword, 
  validatePhone, 
  validateName,
  validateRequired 
} = require('../utils/validators');
const { errorResponse } = require('../utils/response');

const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;
  const errors = [];

  const firstNameValidation = validateName(firstName);
  if (!firstNameValidation.valid) {
    errors.push({ field: 'firstName', message: firstNameValidation.message });
  }

  const lastNameValidation = validateName(lastName);
  if (!lastNameValidation.valid) {
    errors.push({ field: 'lastName', message: lastNameValidation.message });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.push({ field: 'email', message: emailValidation.message });
  }

  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    errors.push({ field: 'phone', message: phoneValidation.message });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    errors.push({ field: 'password', message: passwordValidation.message });
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  const emailValidation = validateRequired(email, 'Email');
  if (!emailValidation.valid) {
    errors.push({ field: 'email', message: emailValidation.message });
  } else {
    const emailFormatValidation = validateEmail(email);
    if (!emailFormatValidation.valid) {
      errors.push({ field: 'email', message: emailFormatValidation.message });
    }
  }

  const passwordValidation = validateRequired(password, 'Password');
  if (!passwordValidation.valid) {
    errors.push({ field: 'password', message: passwordValidation.message });
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  next();
};


const providerValidation = (req, res, next) => {
  const { name, email, phone } = req.body;
  const errors = [];

  const namevalidation = validateName(name);
  if (!namevalidation.valid) {
    errors.push({ field: 'name', message: namevalidation.message });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.push({ field: 'email', message: emailValidation.message });
  }

  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    errors.push({ field: 'phone', message: phoneValidation.message });
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  providerValidation
};

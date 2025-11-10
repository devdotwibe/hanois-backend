const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  getUsers, 
  login, 
  deleteUser,
  add_project 
} = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateRegistration, registerUser);

router.post('/login', validateLogin, login);

router.post('/add_project', authenticateToken, add_project);

router.get('/', getUsers);

router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;

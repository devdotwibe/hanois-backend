const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  getUsers, 
  login, 
  User,
  deleteUser,
  add_project ,
  getMyProjects,
  getPublicProjects,
  forgotPassword
} = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateRegistration, registerUser);

router.post('/login', validateLogin, login);

router.post('/add_project', authenticateToken, add_project);

router.get("/my-projects", authenticateToken, getMyProjects);

router.get("/public-project", getPublicProjects);

router.get('/',authenticateToken, getUsers);

router.get('/get',authenticateToken, User);

router.delete('/:id', authenticateToken, deleteUser);

router.post('/forgot-password', forgotPassword);

module.exports = router;

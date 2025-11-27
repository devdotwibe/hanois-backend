const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  getUsers, 
  login, 
  User,
  deleteUser,
  add_project,
  getMyProjects,
  getPublicProjects,
  forgotPassword,
  upload,
  updateProfile,
  getProjectById,
  updateProject,
  getPublicServices,
  changePassword // ← ADDED
} = require('../controllers/userController');

const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, login);

router.post('/add_project', authenticateToken, add_project);
router.get('/project/:id', authenticateToken, getProjectById);
router.put('/project/:id', authenticateToken, updateProject);

router.get("/my-projects", authenticateToken, getMyProjects);
router.get("/public-project", getPublicProjects);
router.get("/public-services", getPublicServices);

router.get('/', authenticateToken, getUsers);
router.get('/get', authenticateToken, User);

router.post(
  '/update-profile',
  authenticateToken,
  upload.single('profile_image'),
  updateProfile
);

router.post('/change-password', authenticateToken, changePassword); // ← ADDED ROUTE

router.delete('/:id', authenticateToken, deleteUser);

router.post('/forgot-password', forgotPassword);

module.exports = router;

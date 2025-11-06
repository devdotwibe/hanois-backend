const express = require('express');
const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const { authenticateToken } = require('../middleware/auth');
const { categoryValidation } = require('../middleware/validation');

router.post('/', authenticateToken, categoryValidation, createCategory);

router.get('/', getCategories);

router.get('/:id', getCategoryById);

router.put('/:id', authenticateToken, categoryValidation, updateCategory);

router.delete('/:id', authenticateToken, deleteCategory);

module.exports = router;

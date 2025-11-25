const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// Create category
router.post('/', CategoryController.create);

// Get categories assigned to providers
router.get('/', CategoryController.getAll);

// ✅ MUST be before "/:id"
router.get('/all', CategoryController.getAllCategories);

// Get category by ID
router.get('/:id', CategoryController.getById);

// Update category
router.put('/:id', CategoryController.update);

// Delete category
router.delete('/:id', CategoryController.delete);

module.exports = router;

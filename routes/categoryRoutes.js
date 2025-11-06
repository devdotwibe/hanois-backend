const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// Use the static methods directly
router.post('/', CategoryController.create);
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

module.exports = router;

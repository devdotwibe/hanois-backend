const express = require('express');
const router = express.Router();
const designController = require('../controllers/designController');

// Use the static methods directly
router.post('/', designController.create);
router.get('/', designController.getAll);
router.get('/:id', designController.getById);
router.put('/:id', designController.update);
router.delete('/:id', designController.delete);

module.exports = router;

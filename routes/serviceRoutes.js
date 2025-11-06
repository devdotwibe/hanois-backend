const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Use the static methods directly
router.post('/', serviceController.create);
router.get('/', serviceController.getAll);  
router.get('/:id', serviceController.getById);
router.put('/:id', serviceController.update);
router.delete('/:id', serviceController.delete);

module.exports = router;

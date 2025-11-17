const express = require('express');
const router = express.Router();
const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require('../controllers/contactsController');

const { authenticateToken } = require('../middleware/auth');

// If you want to protect routes (optional):
// const { authenticateToken } = require('../middleware/auth');

// Public route to submit a contact form
router.post('/',authenticateToken, createContact);

// Protected admin routes (optional – only if you have authentication)
router.get('/', getContacts);
router.get('/:id',authenticateToken, getContactById);
router.put('/:id',authenticateToken, updateContact);
router.delete('/:id',authenticateToken, deleteContact);

module.exports = router;
 
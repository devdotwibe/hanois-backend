const express = require('express');
const router = express.Router();
const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require('../controllers/contactsController');

// If you want to protect routes (optional):
// const { authenticateToken } = require('../middleware/auth');

// Public route to submit a contact form
router.post('/', createContact);

// Protected admin routes (optional – only if you have authentication)
router.get('/', getContacts);
router.get('/:id', getContactById);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
 
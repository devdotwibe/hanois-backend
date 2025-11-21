const express = require('express');
const router = express.Router();

const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require('../controllers/contactsController');

// Public route to submit a contact form
router.post('/', createContact);

// Admin routes (now public because authentication is removed)
router.get('/', getContacts);
router.get('/:id', getContactById);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;

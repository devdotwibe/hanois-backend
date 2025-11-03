const express = require('express');
const router = express.Router();
const { loginAdmin, getAdmins } = require("../controllers/adminController");
const { authenticateToken } = require('../middleware/auth');

router.post("/login", loginAdmin);
router.get('/', authenticateToken, getAdmins);

module.exports = router;

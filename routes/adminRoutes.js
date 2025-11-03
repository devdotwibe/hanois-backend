const express = require('express');
const router = express.Router();
const { loginAdmin, getAdmins,logoutAdmin } = require("../controllers/adminController");
const { authenticateToken } = require('../middleware/auth');

router.post("/login", loginAdmin);
router.get('/', authenticateToken, getAdmins);

router.post("/logout",logoutAdmin);


module.exports = router;

const express = require('express');
const router = express.Router();
const { loginAdmin, getAdmins,logoutAdmin } = require("../controllers/adminController");
const { authenticateToken } = require('../middleware/auth');

const { getAllTables } = require("../controllers/adminTablesController");

router.post("/login", loginAdmin);
router.get('/', authenticateToken, getAdmins);

router.post("/logout",logoutAdmin);

router.get("/tables", getAllTables);


module.exports = router;

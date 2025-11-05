const express = require("express");
const router = express.Router();

const {
  createPage,
} = require("../controllers/PageController");


router.post("/", createPage);


module.exports = router;

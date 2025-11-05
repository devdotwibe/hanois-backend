const express = require("express");
const router = express.Router();

const {
  createPage,
  getListed,
} = require("../controllers/PageController");


router.post("/save", createPage);

router.get("/get", getListed);


module.exports = router;

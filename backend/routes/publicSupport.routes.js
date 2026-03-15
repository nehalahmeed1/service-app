const express = require("express");
const router = express.Router();

const { createSupportRequest } = require("../controllers/public/support.controller");

router.post("/", createSupportRequest);

module.exports = router;

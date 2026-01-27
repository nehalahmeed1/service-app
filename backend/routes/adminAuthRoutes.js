const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
} = require("../controllers/adminAuthController");

/**
 * Admin Auth Routes
 * (Adjusted to match frontend API calls)
 */

// LOGIN
router.post("/admin/auth/login", loginAdmin);

// REGISTER
router.post("/admin/auth/register", registerAdmin);

module.exports = router;

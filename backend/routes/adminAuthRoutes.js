const express = require("express");
const router = express.Router();

// ✅ CORRECT PATH (file is NOT inside /admin folder)
const {
  registerAdmin,
  loginAdmin,
} = require("../controllers/adminAuthController");

/**
 * BASE PATH:
 * /api
 *
 * FULL ENDPOINTS:
 * POST /api/admin/auth/register
 * POST /api/admin/auth/login
 */

// Register
router.post("/admin/auth/register", registerAdmin);

// Login
router.post("/admin/auth/login", loginAdmin);

module.exports = router;

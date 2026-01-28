const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");

const {
  getAdminDashboardStats,
} = require("../../controllers/admin/adminDashboard.controller");

/**
 * BASE PATH:
 * /api/admin/dashboard
 */

router.get("/", authMiddleware, getAdminDashboardStats);

module.exports = router;

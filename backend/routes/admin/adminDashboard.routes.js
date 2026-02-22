const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../../middleware/adminAuthMiddleware");

const {
  getAdminDashboardStats,
} = require("../../controllers/admin/adminDashboard.controller");

/**
 * BASE PATH:
 * /api/admin/dashboard
 */

router.get(
  "/",
  adminAuthMiddleware,
  getAdminDashboardStats
);

module.exports = router;

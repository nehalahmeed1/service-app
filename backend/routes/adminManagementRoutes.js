const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const superAdminOnly = require("../middleware/superAdminOnly");

const {
  getPendingAdmins,
  approveAdmin,
  rejectAdmin,
} = require("../controllers/adminManageController");

/**
 * ==========================================
 * SUPER ADMIN – ADMIN APPROVAL APIs
 * ==========================================
 */

// Get all pending admins
router.get(
  "/pending",
  adminAuthMiddleware,
  superAdminOnly,
  getPendingAdmins
);

// Approve an admin
router.patch(
  "/approve/:id",
  adminAuthMiddleware,
  superAdminOnly,
  approveAdmin
);

// Reject an admin
router.patch(
  "/reject/:id",
  adminAuthMiddleware,
  superAdminOnly,
  rejectAdmin
);

module.exports = router;

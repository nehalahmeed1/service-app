const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const superAdminOnly = require("../middleware/superAdminOnly");

const {
  getPendingAdmins,
  approveAdmin,
  rejectAdmin
} = require("../controllers/adminManageController");

/**
 * ================================
 * SUPER ADMIN – ADMIN APPROVAL APIs
 * ================================
 */

// Get all pending admins
router.get(
  "/pending",
  authMiddleware,
  superAdminOnly,
  getPendingAdmins
);

// Approve an admin
router.patch(
  "/approve/:id",
  authMiddleware,
  superAdminOnly,
  approveAdmin
);

// Reject an admin
router.patch(
  "/reject/:id",
  authMiddleware,
  superAdminOnly,
  rejectAdmin
);

module.exports = router;

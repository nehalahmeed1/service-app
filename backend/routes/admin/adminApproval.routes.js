const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../../middleware/adminAuthMiddleware");

const adminApprovalController = require("../../controllers/admin/adminApproval.controller");

/**
 * BASE PATH:
 * /api/admin/approvals
 */

// Get providers list
router.get(
  "/providers",
  adminAuthMiddleware,
  adminApprovalController.getPendingProviders
);

// Get admin notification feed for provider updates
router.get(
  "/notifications",
  adminAuthMiddleware,
  adminApprovalController.getApprovalNotifications
);
router.post(
  "/notifications/read",
  adminAuthMiddleware,
  adminApprovalController.markApprovalNotificationsRead
);

// Get single provider details
router.get(
  "/providers/:id",
  adminAuthMiddleware,
  adminApprovalController.getProviderById
);

// Get provider audit trail for approvals
router.get(
  "/providers/:id/audit",
  adminAuthMiddleware,
  adminApprovalController.getProviderAuditTrail
);

// Approve provider
router.patch(
  "/providers/:id/approve",
  adminAuthMiddleware,
  adminApprovalController.approveProvider
);
router.post(
  "/providers/:id/approve",
  adminAuthMiddleware,
  adminApprovalController.approveProvider
);

// Reject provider
router.patch(
  "/providers/:id/reject",
  adminAuthMiddleware,
  adminApprovalController.rejectProvider
);
router.post(
  "/providers/:id/reject",
  adminAuthMiddleware,
  adminApprovalController.rejectProvider
);

// Verify section
router.post(
  "/providers/:id/verify",
  adminAuthMiddleware,
  adminApprovalController.verifySection
);
router.patch(
  "/providers/:id/verify",
  adminAuthMiddleware,
  adminApprovalController.verifySection
);

module.exports = router;

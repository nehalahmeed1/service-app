const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../../middleware/adminAuthMiddleware");
const {
  getServiceRequests,
  getPaymentsOverview,
  getAuditLogs,
  getCompletedJobsEvidence,
  getBookingsFlow,
  getBookingFlowDetails,
} = require("../../controllers/admin/adminOperations.controller");

router.get("/service-requests", adminAuthMiddleware, getServiceRequests);
router.get("/payments", adminAuthMiddleware, getPaymentsOverview);
router.get("/audit-logs", adminAuthMiddleware, getAuditLogs);
router.get("/completed-jobs", adminAuthMiddleware, getCompletedJobsEvidence);
router.get("/bookings", adminAuthMiddleware, getBookingsFlow);
router.get("/bookings/:bookingId", adminAuthMiddleware, getBookingFlowDetails);

module.exports = router;

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
  markBookingPaid,
  resolveBookingDispute,
  getEscalationDashboard,
  getSupportRequests,
  updateSupportRequestStatus,
} = require("../../controllers/admin/adminOperations.controller");

router.get("/service-requests", adminAuthMiddleware, getServiceRequests);
router.get("/payments", adminAuthMiddleware, getPaymentsOverview);
router.get("/audit-logs", adminAuthMiddleware, getAuditLogs);
router.get("/completed-jobs", adminAuthMiddleware, getCompletedJobsEvidence);
router.get("/bookings", adminAuthMiddleware, getBookingsFlow);
router.get("/bookings/:bookingId", adminAuthMiddleware, getBookingFlowDetails);
router.patch("/bookings/:bookingId/payment", adminAuthMiddleware, markBookingPaid);
router.patch("/bookings/:bookingId/disputes/:disputeId/resolve", adminAuthMiddleware, resolveBookingDispute);
router.get("/escalations", adminAuthMiddleware, getEscalationDashboard);
router.get("/support-requests", adminAuthMiddleware, getSupportRequests);
router.patch("/support-requests/:requestId/status", adminAuthMiddleware, updateSupportRequestStatus);

module.exports = router;

const express = require("express");
const router = express.Router();

const providerAuthMiddleware = require("../../middleware/providerAuthMiddleware");
const { uploadBookingProof } = require("../../config/multer");
const {
  getIncomingRequests,
  getProviderJobs,
  getProviderBookingStats,
  updateBookingStatus,
  uploadCompletionProof,
  cancelBookingByProvider,
} = require("../../controllers/provider/providerBooking.controller");

router.get("/requests", providerAuthMiddleware, getIncomingRequests);
router.get("/jobs", providerAuthMiddleware, getProviderJobs);
router.get("/stats", providerAuthMiddleware, getProviderBookingStats);
router.patch("/:bookingId/status", providerAuthMiddleware, updateBookingStatus);
router.patch("/:bookingId/cancel", providerAuthMiddleware, cancelBookingByProvider);
router.post(
  "/:bookingId/proof",
  providerAuthMiddleware,
  uploadBookingProof.array("images", 5),
  uploadCompletionProof
);

module.exports = router;

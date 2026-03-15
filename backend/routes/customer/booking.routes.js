const express = require("express");
const router = express.Router();

const customerAuthMiddleware = require("../../middleware/customerAuthMiddleware");
const {
  createBooking,
  getCustomerBookings,
  cancelCustomerBooking,
  rescheduleCustomerBooking,
  raiseCustomerDispute,
  submitCustomerReview,
  submitCustomerPayment,
} = require("../../controllers/customer/booking.controller");

router.get("/", customerAuthMiddleware, getCustomerBookings);
router.post("/", customerAuthMiddleware, createBooking);
router.patch("/:bookingId/cancel", customerAuthMiddleware, cancelCustomerBooking);
router.patch("/:bookingId/reschedule", customerAuthMiddleware, rescheduleCustomerBooking);
router.post("/:bookingId/dispute", customerAuthMiddleware, raiseCustomerDispute);
router.post("/:bookingId/review", customerAuthMiddleware, submitCustomerReview);
router.post("/:bookingId/payment", customerAuthMiddleware, submitCustomerPayment);

module.exports = router;

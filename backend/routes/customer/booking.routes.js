const express = require("express");
const router = express.Router();

const customerAuthMiddleware = require("../../middleware/customerAuthMiddleware");
const {
  createBooking,
  getCustomerBookings,
  cancelCustomerBooking,
} = require("../../controllers/customer/booking.controller");

router.get("/", customerAuthMiddleware, getCustomerBookings);
router.post("/", customerAuthMiddleware, createBooking);
router.patch("/:bookingId/cancel", customerAuthMiddleware, cancelCustomerBooking);

module.exports = router;

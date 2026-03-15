const mongoose = require("mongoose");
const Booking = require("../../models/Booking");
const SupportRequest = require("../../models/SupportRequest");

exports.createSupportRequest = async (req, res) => {
  try {
    const {
      type = "CONTACT",
      name = "",
      email = "",
      phone = "",
      city = "",
      subject = "",
      message = "",
      bookingId = "",
      source = "WEB",
    } = req.body || {};

    const normalizedType = String(type).toUpperCase();
    if (!["CONTACT", "COMPLAINT"].includes(normalizedType)) {
      return res.status(400).json({ message: "Invalid support request type" });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanSubject = String(subject).trim();
    const cleanMessage = String(message).trim();

    if (!cleanName || !cleanEmail || !cleanSubject || cleanMessage.length < 10) {
      return res.status(400).json({
        message: "Name, email, subject and detailed message are required",
      });
    }

    let resolvedBookingId = null;
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      const exists = await Booking.exists({ _id: bookingId });
      if (!exists) {
        return res.status(404).json({ message: "Booking not found for complaint" });
      }
      resolvedBookingId = bookingId;
    }

    if (normalizedType === "COMPLAINT" && !resolvedBookingId) {
      return res.status(400).json({ message: "Booking ID is required for complaint requests" });
    }

    const priority = normalizedType === "COMPLAINT" ? "HIGH" : "MEDIUM";

    const doc = await SupportRequest.create({
      type: normalizedType,
      name: cleanName,
      email: cleanEmail,
      phone: String(phone || "").trim(),
      city: String(city || "").trim(),
      subject: cleanSubject,
      message: cleanMessage,
      bookingId: resolvedBookingId,
      priority,
      source: String(source || "WEB").trim() || "WEB",
      status: "OPEN",
    });

    return res.status(201).json({
      success: true,
      data: {
        id: doc._id,
        type: doc.type,
        status: doc.status,
        priority: doc.priority,
        createdAt: doc.createdAt,
      },
    });
  } catch (error) {
    console.error("Create support request error:", error);
    return res.status(500).json({ message: "Failed to submit support request" });
  }
};

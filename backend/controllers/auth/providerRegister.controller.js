const Provider = require("../../models/Provider");
const mongoose = require("mongoose");

const registerProvider = async (req, res) => {
  try {
    const { firebaseUid, name, email, service, location, phone } = req.body;

    if (!firebaseUid || !name || !email) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Prevent duplicate provider and keep registration idempotent.
    const existing = await Provider.findOne({
      $or: [{ firebaseUid }, { email: normalizedEmail }],
    });
    if (existing) {
      if (existing.firebaseUid !== firebaseUid) {
        existing.firebaseUid = firebaseUid;
        await existing.save();
      }

      return res.status(200).json({
        success: true,
        message: "Provider already registered",
        provider: existing,
      });
    }

    const provider = await Provider.create({
      userId: new mongoose.Types.ObjectId(), // temporary placeholder
      firebaseUid,
      name,
      email: normalizedEmail,
      service: service || "",
      location: location || "",
      phone: phone || "",
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Provider registered successfully",
      provider,
    });
  } catch (error) {
    console.error("Provider register error:", error);
    res.status(500).json({
      message: "Server error while registering provider",
    });
  }
};

module.exports = { registerProvider };

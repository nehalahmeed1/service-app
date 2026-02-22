const Provider = require("../../models/Provider");

exports.uploadAddress = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized provider",
      });
    }

    const provider =
      req.provider ||
      (req.user?.providerId
        ? await Provider.findById(req.user.providerId)
        : null);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const { addressLine, city, state, pincode } = req.body;

    if (!addressLine || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Address details are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Address proof document is required",
      });
    }

    const addressPayload = {
      status: "PENDING",
      addressLine,
      city,
      state,
      pincode,
      documents: [
        `/uploads/address/${req.file.filename}`,
      ],
    };

    await Provider.findByIdAndUpdate(provider._id, {
      $set: {
        "verification.address": addressPayload,
      },
    });

    return res.json({
      success: true,
      message: "Address details uploaded successfully",
    });
  } catch (error) {
    console.error("ADDRESS UPLOAD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

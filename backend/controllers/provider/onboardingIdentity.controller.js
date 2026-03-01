const Provider = require("../../models/Provider");

exports.uploadIdentity = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized provider" });
    }

    // Prefer provider loaded by auth middleware; fallback by providerId.
    const provider =
      req.provider ||
      (req.user?.providerId
        ? await Provider.findById(req.user.providerId)
        : null);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ message: "Aadhaar number is required" });
    }

    if (!req.files?.aadhaarFront || !req.files?.aadhaarBack) {
      return res.status(400).json({
        message: "Aadhaar front and back images are required",
      });
    }

    const now = new Date();
    const existingIdentity = provider.verification?.identity || {};

    const identityPayload = {
      status: "PENDING",
      remarks: "",
      verifiedBy: null,
      verifiedAt: null,
      aadhaarNumber,
      documents: [
        `/uploads/identity/${req.files.aadhaarFront[0].filename}`,
        `/uploads/identity/${req.files.aadhaarBack[0].filename}`,
      ],
      createdAt: existingIdentity.createdAt || now,
      updatedAt: now,
      submittedAt: now,
      submittedBy: req.user.id,
      lastAction: existingIdentity.createdAt ? "UPDATE" : "CREATE",
    };

    await Provider.findByIdAndUpdate(provider._id, {
      $set: {
        status: "PENDING",
        "approval.approvedBy": null,
        "approval.approvedAt": null,
        "approval.rejectionReason": null,
        "verification.identity": identityPayload,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Identity upload error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

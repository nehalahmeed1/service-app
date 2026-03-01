const Provider = require("../../models/Provider");

exports.uploadProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized provider" });
    }

    const provider =
      req.provider ||
      (req.user?.providerId
        ? await Provider.findById(req.user.providerId)
        : null);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const { fullName, phone } = req.body;
    if (!fullName || !phone) {
      return res
        .status(400)
        .json({ message: "Full name and phone are required" });
    }

    const existingDoc =
      provider.verification?.profile?.documents?.[0] || provider.avatar || "";

    if (!req.file && !existingDoc) {
      return res.status(400).json({ message: "Profile photo is required" });
    }

    const profileDocPath = req.file
      ? `/uploads/profile/${req.file.filename}`
      : existingDoc;

    const now = new Date();
    const existingProfile = provider.verification?.profile || {};

    const profilePayload = {
      status: "PENDING",
      remarks: "",
      verifiedBy: null,
      verifiedAt: null,
      fullName,
      phone,
      documents: [profileDocPath],
      createdAt: existingProfile.createdAt || now,
      updatedAt: now,
      submittedAt: now,
      submittedBy: req.user.id,
      lastAction: existingProfile.createdAt ? "UPDATE" : "CREATE",
    };

    await Provider.findByIdAndUpdate(provider._id, {
      $set: {
        status: "PENDING",
        "approval.approvedBy": null,
        "approval.approvedAt": null,
        "approval.rejectionReason": null,
        name: fullName,
        phone,
        avatar: profileDocPath,
        "verification.profile": profilePayload,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Profile upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

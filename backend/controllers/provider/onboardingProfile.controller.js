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

    if (!req.file) {
      return res.status(400).json({ message: "Profile photo is required" });
    }

    const profilePayload = {
      status: "PENDING",
      fullName,
      phone,
      documents: [`/uploads/profile/${req.file.filename}`],
    };

    await Provider.findByIdAndUpdate(provider._id, {
      $set: {
        name: fullName,
        phone,
        avatar: `/uploads/profile/${req.file.filename}`,
        "verification.profile": profilePayload,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Profile upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

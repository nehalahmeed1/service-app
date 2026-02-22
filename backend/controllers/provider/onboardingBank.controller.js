const Provider = require("../../models/Provider");

exports.uploadBank = async (req, res) => {
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

    const { accountHolderName, accountNumber, ifscCode } = req.body;
    if (!accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        message: "Bank details are required",
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Bank proof document is required" });
    }

    const bankPayload = {
      status: "PENDING",
      accountHolderName,
      accountNumber,
      ifscCode,
      documents: [`/uploads/bank/${req.file.filename}`],
    };

    await Provider.findByIdAndUpdate(provider._id, {
      $set: {
        "verification.bank": bankPayload,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Bank upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

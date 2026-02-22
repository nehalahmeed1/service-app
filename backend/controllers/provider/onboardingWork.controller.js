const Provider = require("../../models/Provider");

exports.uploadWork = async (req, res) => {
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

    const { categoryId, experienceYears } = req.body;
    if (!categoryId || !experienceYears) {
      return res.status(400).json({
        message: "Category and years of experience are required",
      });
    }

    const workImages = req.files?.workImages || [];
    const certificate = req.files?.certificate?.[0] || null;

    if (workImages.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one work image is required" });
    }

    const workImagePaths = workImages.map(
      (f) => `/uploads/work/${f.filename}`
    );

    const certificatePath = certificate
      ? `/uploads/work/${certificate.filename}`
      : null;

    const documents = certificatePath
      ? [...workImagePaths, certificatePath]
      : workImagePaths;

    const workPayload = {
      status: "PENDING",
      categoryId,
      experienceYears: Number(experienceYears),
      workImages: workImagePaths,
      certificate: certificatePath,
      documents,
    };

    await Provider.findByIdAndUpdate(provider._id, {
      $set: {
        "verification.work": workPayload,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Work upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const Provider = require("../../models/Provider");
const SubCategory = require("../../models/SubCategory");

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

    const { categoryId, subCategoryId, experienceYears } = req.body;
    if (!categoryId || !experienceYears) {
      return res.status(400).json({
        message: "Category and years of experience are required",
      });
    }

    if (subCategoryId) {
      const validSubCategory = await SubCategory.findOne({
        _id: subCategoryId,
        category_id: categoryId,
        status: { $in: ["active", "ACTIVE"] },
        $or: [{ deletedAt: null }, { deleted_at: null }],
      });

      if (!validSubCategory) {
        return res.status(400).json({
          message: "Invalid sub-category for selected category",
        });
      }
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

    const now = new Date();
    const existingWork = provider.verification?.work || {};

    const workPayload = {
      status: "PENDING",
      remarks: "",
      verifiedBy: null,
      verifiedAt: null,
      categoryId,
      subCategoryId: subCategoryId || null,
      experienceYears: Number(experienceYears),
      workImages: workImagePaths,
      certificate: certificatePath,
      documents,
      createdAt: existingWork.createdAt || now,
      updatedAt: now,
      submittedAt: now,
      submittedBy: req.user.id,
      lastAction: existingWork.createdAt ? "UPDATE" : "CREATE",
    };

    await Provider.findByIdAndUpdate(provider._id, {
      $set: {
        status: "PENDING",
        "approval.approvedBy": null,
        "approval.approvedAt": null,
        "approval.rejectionReason": null,
        "verification.work": workPayload,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Work upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const Provider = require("../../models/Provider");
const AdminAuditLog = require("../../models/AdminAuditLog");

/**
 * =========================================================
 * GET PROVIDERS FOR ADMIN APPROVAL LIST
 * GET /api/admin/approvals/providers
 * =========================================================
 */
exports.getPendingProviders = async (req, res) => {
  try {
    const { status = "PENDING", search = "" } = req.query;

    const filter = { deletedAt: null };

    if (status !== "ALL") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const providers = await Provider.find(filter)
      .populate("approval.approvedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: providers });
  } catch (error) {
    console.error("Fetch providers error:", error);
    res.status(500).json({ message: "Failed to fetch providers" });
  }
};

/**
 * =========================================================
 * ✅ GET SINGLE PROVIDER (ADMIN DETAIL VIEW)
 * FIXED: Supports BOTH provider _id & firebaseUid
 * GET /api/admin/approvals/providers/:id
 * =========================================================
 */
exports.getProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Admin provider detail ID:", id);

    const provider = await Provider.findOne({
      deletedAt: null,
      $or: [
        { _id: id },
        { firebaseUid: id },
      ],
    }).populate("approval.approvedBy", "name email");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ success: true, data: provider });
  } catch (error) {
    console.error("Get provider error:", error);
    res.status(500).json({ message: "Failed to load provider" });
  }
};

/**
 * =========================================================
 * APPROVE PROVIDER
 * POST /api/admin/approvals/providers/:id/approve
 * =========================================================
 */
exports.approveProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.status = "APPROVED";
    provider.approval = {
      approvedBy: req.admin?._id || null,
      approvedAt: new Date(),
      rejectionReason: null,
    };

    await provider.save();

    await AdminAuditLog.create({
      adminId: req.admin?._id,
      action: "APPROVE_PROVIDER",
      targetType: "PROVIDER",
      targetId: provider._id,
      providerId: provider._id,
      section: null,
      status: "APPROVED",
      remarks: null,
      ipAddress: req.ip || null,
      metadata: {
        providerStatus: provider.status,
      },
    });

    res.json({ success: true, message: "Provider approved" });
  } catch (error) {
    console.error("Approve provider error:", error);
    res.status(500).json({ message: "Approval failed" });
  }
};

/**
 * =========================================================
 * REJECT PROVIDER
 * POST /api/admin/approvals/providers/:id/reject
 * =========================================================
 */
exports.rejectProvider = async (req, res) => {
  try {
    const { reason } = req.body;

    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.status = "REJECTED";
    provider.approval = {
      approvedBy: req.admin?._id || null,
      approvedAt: new Date(),
      rejectionReason: reason || "Not specified",
    };

    await provider.save();

    await AdminAuditLog.create({
      adminId: req.admin?._id,
      action: "REJECT_PROVIDER",
      targetType: "PROVIDER",
      targetId: provider._id,
      providerId: provider._id,
      section: null,
      status: "REJECTED",
      remarks: reason || "Not specified",
      ipAddress: req.ip || null,
      metadata: {
        providerStatus: provider.status,
      },
    });

    res.json({ success: true, message: "Provider rejected" });
  } catch (error) {
    console.error("Reject provider error:", error);
    res.status(500).json({ message: "Rejection failed" });
  }
};

/**
 * =========================================================
 * VERIFY INDIVIDUAL SECTION
 * POST /api/admin/approvals/providers/:id/verify
 * =========================================================
 */
exports.verifySection = async (req, res) => {
  try {
    const { section, status, remarks = "" } = req.body;

    const allowedSections = [
      "profile",
      "identity",
      "address",
      "work",
      "bank",
    ];
    const allowedStatus = ["VERIFIED", "REJECTED"];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({ message: "Invalid section" });
    }

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status === "REJECTED" && !remarks.trim()) {
      return res
        .status(400)
        .json({ message: "Remarks are required for rejection" });
    }

    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const currentSection = provider.verification?.[section] || {};
    provider.verification[section] = {
      ...currentSection.toObject?.(),
      ...currentSection,
      status,
      remarks: remarks.trim() || "",
      verifiedBy: req.admin?._id || null,
      verifiedAt: new Date(),
    };

    await provider.save();

    await AdminAuditLog.create({
      adminId: req.admin?._id,
      action: `VERIFY_${section.toUpperCase()}`,
      targetType: "PROVIDER",
      targetId: provider._id,
      providerId: provider._id,
      section,
      status,
      remarks: remarks.trim() || null,
      ipAddress: req.ip || null,
      metadata: {
        sectionStatus: provider.verification?.[section]?.status || status,
      },
    });

    return res.json({
      success: true,
      message: `${section} marked as ${status}`,
      data: provider.verification[section],
    });
  } catch (error) {
    console.error("Verify section error:", error);
    return res.status(500).json({ message: "Verification update failed" });
  }
};

const Provider = require("../../models/Provider");
const AdminAuditLog = require("../../models/AdminAuditLog");

const SECTION_KEYS = ["profile", "identity", "address", "work", "bank"];

function hasData(section = {}) {
  const docs = Array.isArray(section.documents) ? section.documents : [];
  if (docs.length > 0) return true;

  const keys = Object.keys(section).filter(
    (k) =>
      !["status", "verifiedBy", "verifiedAt", "remarks", "documents"].includes(
        k
      )
  );

  return keys.some(
    (k) => section[k] !== undefined && section[k] !== null && section[k] !== ""
  );
}

exports.getProviderKpi = async (req, res) => {
  try {
    const provider =
      req.provider ||
      (req.user?.providerId
        ? await Provider.findById(req.user.providerId).lean()
        : null);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const sections = SECTION_KEYS.map((key) => provider.verification?.[key] || {});
    const uploadedSections = sections.filter((s) => hasData(s)).length;
    const verifiedSections = sections.filter((s) => s.status === "VERIFIED").length;
    const rejectedSections = sections.filter((s) => s.status === "REJECTED").length;
    const pendingSections = SECTION_KEYS.length - verifiedSections - rejectedSections;
    const totalDocuments = sections.reduce((sum, s) => {
      const docs = Array.isArray(s.documents) ? s.documents.length : 0;
      return sum + docs;
    }, 0);

    const profileChecks = [
      !!provider.name,
      !!provider.phone,
      !!provider.service,
      !!provider.location,
      !!provider.bio,
      (provider.yearsExperience || 0) > 0,
      !!provider.avatar,
    ];
    const profileCompleteness = Math.round(
      (profileChecks.filter(Boolean).length / profileChecks.length) * 100
    );

    const [rejectionCount, verifiedActionCount] = await Promise.all([
      AdminAuditLog.countDocuments({
        providerId: provider._id,
        status: "REJECTED",
      }),
      AdminAuditLog.countDocuments({
        providerId: provider._id,
        status: "VERIFIED",
      }),
    ]);

    const accountAgeDays = Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(provider.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    return res.json({
      success: true,
      data: {
        providerStatus: provider.status || "PENDING",
        onboardingCompleted: !!provider.onboardingCompleted,
        metrics: {
          profileCompleteness,
          uploadedSections,
          verifiedSections,
          rejectedSections,
          pendingSections,
          totalDocuments,
          rejectionCount,
          verifiedActionCount,
          accountAgeDays,
        },
      },
    });
  } catch (error) {
    console.error("Get provider KPI error:", error);
    return res.status(500).json({ message: "Failed to load KPI metrics" });
  }
};

exports.getVerificationHistory = async (req, res) => {
  try {
    const providerId = req.user?.providerId;
    if (!providerId) {
      return res.status(401).json({ message: "Unauthorized provider" });
    }

    const [provider, logs] = await Promise.all([
      Provider.findById(providerId).lean(),
      AdminAuditLog.find({ providerId })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("adminId", "name email")
        .lean(),
    ]);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const timeline = logs.map((log) => ({
      id: log._id,
      action: log.action,
      section: log.section,
      status: log.status,
      remarks: log.remarks || "",
      admin: log.adminId
        ? {
            id: log.adminId._id,
            name: log.adminId.name,
            email: log.adminId.email,
          }
        : null,
      createdAt: log.createdAt,
      metadata: log.metadata || {},
    }));

    if (provider.approval?.rejectionReason) {
      timeline.unshift({
        id: "approval-rejection-reason",
        action: "FINAL_DECISION",
        section: null,
        status: provider.status || "REJECTED",
        remarks: provider.approval.rejectionReason,
        admin: null,
        createdAt: provider.approval.approvedAt || provider.updatedAt,
        metadata: { source: "provider.approval.rejectionReason" },
      });
    }

    return res.json({
      success: true,
      data: {
        providerStatus: provider.status || "PENDING",
        timeline,
      },
    });
  } catch (error) {
    console.error("Get verification history error:", error);
    return res.status(500).json({ message: "Failed to load verification history" });
  }
};

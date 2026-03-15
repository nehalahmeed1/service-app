const Provider = require("../../models/Provider");
const AdminAuditLog = require("../../models/AdminAuditLog");
const Admin = require("../../models/Admin");

const SECTION_KEYS = ["profile", "identity", "address", "work", "bank"];

function areAllSectionsVerified(provider) {
  if (!provider?.verification) return false;
  return SECTION_KEYS.every(
    (sectionKey) => provider.verification?.[sectionKey]?.status === "VERIFIED"
  );
}

async function syncProviderStatusFromSectionState() {
  const unverifiedSectionQuery = {
    $or: SECTION_KEYS.map((sectionKey) => ({
      [`verification.${sectionKey}.status`]: { $in: ["PENDING", "REJECTED"] },
    })),
  };

  await Provider.updateMany(
    {
      deletedAt: null,
      status: { $in: ["REJECTED", "APPROVED"] },
      ...unverifiedSectionQuery,
    },
    {
      $set: {
        status: "PENDING",
        "approval.approvedBy": null,
        "approval.approvedAt": null,
        "approval.rejectionReason": null,
      },
    }
  );
}

async function findProviderByIdOrFirebaseUid(id) {
  return Provider.findOne({
    deletedAt: null,
    $or: [{ _id: id }, { firebaseUid: id }],
  });
}

function hasSectionData(section = {}) {
  const docs = Array.isArray(section.documents) ? section.documents : [];
  if (docs.length > 0) return true;

  return Object.keys(section).some((key) => {
    if (
      [
        "status",
        "remarks",
        "verifiedBy",
        "verifiedAt",
        "documents",
        "createdAt",
        "updatedAt",
        "submittedAt",
        "submittedBy",
        "lastAction",
      ].includes(key)
    ) {
      return false;
    }

    const value = section[key];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  });
}

/**
 * =========================================================
 * GET PROVIDERS FOR ADMIN APPROVAL LIST
 * GET /api/admin/approvals/providers
 * =========================================================
 */
exports.getPendingProviders = async (req, res) => {
  try {
    await syncProviderStatusFromSectionState();

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
    await syncProviderStatusFromSectionState();

    const { id } = req.params;

    console.log("Admin provider detail ID:", id);

    const provider = await Provider.findOne({
      deletedAt: null,
      $or: [
        { _id: id },
        { firebaseUid: id },
      ],
    })
      .populate("approval.approvedBy", "name email")
      .populate("verification.profile.verifiedBy", "name email")
      .populate("verification.identity.verifiedBy", "name email")
      .populate("verification.address.verifiedBy", "name email")
      .populate("verification.work.verifiedBy", "name email")
      .populate("verification.bank.verifiedBy", "name email");

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
    const provider = await findProviderByIdOrFirebaseUid(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (!areAllSectionsVerified(provider)) {
      return res.status(400).json({
        message: "All verification sections must be VERIFIED before approval",
      });
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
    const reason = String(req.body?.reason || "").trim();

    const provider = await findProviderByIdOrFirebaseUid(req.params.id);
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

    const provider = await findProviderByIdOrFirebaseUid(req.params.id);
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

/**
 * =========================================================
 * GET ADMIN NOTIFICATIONS FOR PROVIDER UPDATES
 * GET /api/admin/approvals/notifications
 * =========================================================
 */
exports.getApprovalNotifications = async (req, res) => {
  try {
    await syncProviderStatusFromSectionState();
    const readAt = req.admin?.approvalNotificationsReadAt
      ? new Date(req.admin.approvalNotificationsReadAt)
      : null;

    const providers = await Provider.find({
      deletedAt: null,
      onboardingCompleted: true,
    })
      .select("name email status verification updatedAt")
      .lean();

    const notifications = [];

    providers.forEach((provider) => {
      SECTION_KEYS.forEach((sectionKey) => {
        const section = provider.verification?.[sectionKey] || {};
        if (!hasSectionData(section)) return;
        if (section.status !== "PENDING") return;

        const happenedAt =
          section.submittedAt || section.updatedAt || provider.updatedAt;

        notifications.push({
          id: `${provider._id}-${sectionKey}-${new Date(happenedAt).getTime()}`,
          providerId: provider._id,
          providerName: provider.name,
          providerEmail: provider.email,
          section: sectionKey,
          action: section.lastAction || "UPDATE",
          status: section.status,
          createdAt: happenedAt,
        });
      });
    });

    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const unreadCount = readAt
      ? notifications.filter(
          (item) => new Date(item.createdAt).getTime() > readAt.getTime()
        ).length
      : notifications.length;

    return res.json({
      success: true,
      data: {
        unreadCount,
        readAt,
        notifications: notifications.slice(0, 20),
      },
    });
  } catch (error) {
    console.error("Get approval notifications error:", error);
    return res.status(500).json({ message: "Failed to load notifications" });
  }
};

/**
 * =========================================================
 * MARK APPROVAL NOTIFICATIONS AS READ
 * POST /api/admin/approvals/notifications/read
 * =========================================================
 */
exports.markApprovalNotificationsRead = async (req, res) => {
  try {
    if (!req.admin?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();
    await Admin.updateOne(
      { _id: req.admin._id },
      { $set: { approvalNotificationsReadAt: now } }
    );

    return res.json({
      success: true,
      data: {
        readAt: now,
      },
    });
  } catch (error) {
    console.error("Mark approval notifications read error:", error);
    return res.status(500).json({ message: "Failed to update notification status" });
  }
};

/**
 * =========================================================
 * GET PROVIDER AUDIT TRAIL FOR ADMIN
 * GET /api/admin/approvals/providers/:id/audit
 * =========================================================
 */
exports.getProviderAuditTrail = async (req, res) => {
  try {
    await syncProviderStatusFromSectionState();

    const { id } = req.params;

    const provider = await Provider.findOne({
      deletedAt: null,
      $or: [{ _id: id }, { firebaseUid: id }],
    }).lean();

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const adminLogs = await AdminAuditLog.find({ providerId: provider._id })
      .sort({ createdAt: -1 })
      .populate("adminId", "name email")
      .lean();

    const adminIdSet = new Set();
    SECTION_KEYS.forEach((sectionKey) => {
      const verifiedBy = provider.verification?.[sectionKey]?.verifiedBy;
      if (verifiedBy) adminIdSet.add(String(verifiedBy));
    });

    const admins = adminIdSet.size
      ? await Admin.find({ _id: { $in: Array.from(adminIdSet) } })
          .select("name email")
          .lean()
      : [];

    const adminMap = new Map(admins.map((admin) => [String(admin._id), admin]));

    const sectionAudit = SECTION_KEYS.map((sectionKey) => {
      const section = provider.verification?.[sectionKey] || {};
      const verifiedById = section.verifiedBy ? String(section.verifiedBy) : null;
      const verifiedByAdmin = verifiedById ? adminMap.get(verifiedById) : null;

      return {
        key: sectionKey,
        status: section.status || "PENDING",
        remarks: section.remarks || "",
        createdAt: section.createdAt || null,
        updatedAt: section.updatedAt || null,
        submittedAt: section.submittedAt || null,
        submittedBy: section.submittedBy || null,
        verifiedAt: section.verifiedAt || null,
        verifiedBy: verifiedByAdmin
          ? {
              id: verifiedByAdmin._id,
              name: verifiedByAdmin.name,
              email: verifiedByAdmin.email,
            }
          : null,
        lastAction: section.lastAction || null,
      };
    });

    const timeline = adminLogs.map((log) => ({
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

    return res.json({
      success: true,
      data: {
        providerId: provider._id,
        providerStatus: provider.status || "PENDING",
        sectionAudit,
        timeline,
      },
    });
  } catch (error) {
    console.error("Get provider audit trail error:", error);
    return res.status(500).json({ message: "Failed to load provider audit trail" });
  }
};

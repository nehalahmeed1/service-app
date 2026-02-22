const Provider = require("../../models/Provider");

const SECTION_KEYS = ["profile", "identity", "address", "work", "bank"];

function hasData(section = {}) {
  const docs = Array.isArray(section.documents) ? section.documents : [];
  if (docs.length > 0) return true;

  const dataKeys = Object.keys(section).filter(
    (key) =>
      !["status", "verifiedBy", "verifiedAt", "remarks", "documents"].includes(
        key
      )
  );

  return dataKeys.some(
    (key) =>
      section[key] !== undefined && section[key] !== null && section[key] !== ""
  );
}

exports.getOnboardingStatus = async (req, res) => {
  try {
    const provider =
      req.provider ||
      (req.user?.providerId
        ? await Provider.findById(req.user.providerId).lean()
        : null);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const sections = SECTION_KEYS.map((key, index) => {
      const section = provider.verification?.[key] || {};
      const uploaded = hasData(section);
      const documents = Array.isArray(section.documents) ? section.documents : [];

      return {
        key,
        step: index,
        uploaded,
        status: section.status || "PENDING",
        documentCount: documents.length,
        remarks: section.remarks || "",
        data: section,
      };
    });

    const missingSections = sections
      .filter((s) => !s.uploaded)
      .map((s) => s.key);

    return res.json({
      success: true,
      data: {
        providerStatus: provider.status || "PENDING",
        onboardingCompleted: !!provider.onboardingCompleted,
        profile: {
          name:
            provider.name ||
            provider.verification?.profile?.fullName ||
            "",
          phone:
            provider.phone ||
            provider.verification?.profile?.phone ||
            "",
          avatar:
            provider.avatar ||
            provider.verification?.profile?.documents?.[0] ||
            "",
          service: provider.service || "",
          location: provider.location || "",
          bio: provider.bio || "",
          yearsExperience: provider.yearsExperience || 0,
        },
        sections,
        missingSections,
      },
    });
  } catch (error) {
    console.error("Get onboarding status error:", error);
    return res.status(500).json({ message: "Failed to fetch onboarding status" });
  }
};

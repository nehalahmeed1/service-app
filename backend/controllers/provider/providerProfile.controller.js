const Provider = require("../../models/Provider");

exports.getMyProfile = async (req, res) => {
  try {
    const provider =
      req.provider ||
      (req.user?.providerId
        ? await Provider.findById(req.user.providerId)
        : null);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    return res.json({
      success: true,
      data: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone || "",
        service: provider.service || "",
        location: provider.location || "",
        bio: provider.bio || "",
        yearsExperience: provider.yearsExperience || 0,
        avatar: provider.avatar || "",
        status: provider.status,
        onboardingCompleted: !!provider.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Get provider profile error:", error);
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const providerId = req.user?.providerId;
    if (!providerId) {
      return res.status(401).json({ message: "Unauthorized provider" });
    }

    const { name, phone, service, location, bio, yearsExperience } = req.body;

    const updates = {};
    if (typeof name === "string") updates.name = name.trim();
    if (typeof phone === "string") updates.phone = phone.trim();
    if (typeof service === "string") updates.service = service.trim();
    if (typeof location === "string") updates.location = location.trim();
    if (typeof bio === "string") updates.bio = bio.trim();
    if (yearsExperience !== undefined) {
      const n = Number(yearsExperience);
      updates.yearsExperience = Number.isFinite(n) ? Math.max(0, n) : 0;
    }

    if (req.file) {
      updates.avatar = `/uploads/profile/${req.file.filename}`;
    }

    const provider = await Provider.findByIdAndUpdate(
      providerId,
      { $set: updates },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone || "",
        service: provider.service || "",
        location: provider.location || "",
        bio: provider.bio || "",
        yearsExperience: provider.yearsExperience || 0,
        avatar: provider.avatar || "",
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Update provider profile error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

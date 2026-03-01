const Provider = require("../../models/Provider");
const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");

const notDeletedQuery = {
  $or: [{ deletedAt: null }, { deleted_at: null }, { deletedAt: { $exists: false } }],
};

exports.getMyProfile = async (req, res) => {
  try {
    const providerBase =
      req.provider ||
      (req.user?.providerId ? await Provider.findById(req.user.providerId) : null);

    if (!providerBase) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const provider = await Provider.findById(providerBase._id)
      .populate("serviceCategoryId", "name")
      .populate("serviceSubCategoryId", "name category_id");

    return res.json({
      success: true,
      data: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone || "",
        service: provider.service || "",
        serviceCategoryId: provider.serviceCategoryId?._id || null,
        serviceCategoryName: provider.serviceCategoryId?.name || "",
        serviceSubCategoryId: provider.serviceSubCategoryId?._id || null,
        serviceSubCategoryName: provider.serviceSubCategoryId?.name || "",
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

    const {
      name,
      phone,
      service,
      serviceCategoryId,
      serviceSubCategoryId,
      location,
      bio,
      yearsExperience,
    } = req.body;

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

    let selectedCategory = null;
    let selectedSubCategory = null;

    if (serviceCategoryId) {
      selectedCategory = await Category.findOne({
        _id: serviceCategoryId,
        status: { $in: ["active", "ACTIVE"] },
        ...notDeletedQuery,
      }).select("_id name");

      if (!selectedCategory) {
        return res.status(400).json({ message: "Invalid category" });
      }

      updates.serviceCategoryId = selectedCategory._id;
    } else if (serviceCategoryId === "" || serviceCategoryId === null) {
      updates.serviceCategoryId = null;
    }

    if (serviceSubCategoryId) {
      const subQuery = {
        _id: serviceSubCategoryId,
        status: { $in: ["active", "ACTIVE"] },
        ...notDeletedQuery,
      };

      if (selectedCategory?._id) {
        subQuery.category_id = selectedCategory._id;
      }

      selectedSubCategory = await SubCategory.findOne(subQuery).select(
        "_id name category_id"
      );

      if (!selectedSubCategory) {
        return res.status(400).json({ message: "Invalid sub-category" });
      }

      updates.serviceSubCategoryId = selectedSubCategory._id;
      updates.serviceCategoryId = selectedSubCategory.category_id;
    } else if (serviceSubCategoryId === "" || serviceSubCategoryId === null) {
      updates.serviceSubCategoryId = null;
    }

    if (selectedSubCategory?.name) {
      updates.service = selectedSubCategory.name;
    } else if (selectedCategory?.name) {
      updates.service = selectedCategory.name;
    }

    if (req.file) {
      updates.avatar = `/uploads/profile/${req.file.filename}`;
    }

    const provider = await Provider.findByIdAndUpdate(
      providerId,
      { $set: updates },
      { new: true }
    )
      .populate("serviceCategoryId", "name")
      .populate("serviceSubCategoryId", "name");

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
        serviceCategoryId: provider.serviceCategoryId?._id || null,
        serviceCategoryName: provider.serviceCategoryId?.name || "",
        serviceSubCategoryId: provider.serviceSubCategoryId?._id || null,
        serviceSubCategoryName: provider.serviceSubCategoryId?.name || "",
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

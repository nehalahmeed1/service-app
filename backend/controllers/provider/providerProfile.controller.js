const Provider = require("../../models/Provider");
const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");

const notDeletedQuery = {
  $or: [{ deletedAt: null }, { deleted_at: null }, { deletedAt: { $exists: false } }],
};

function normalizeObjectIdArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (value === null || value === undefined) return [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch (_) {
        return [];
      }
    }

    return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [String(value).trim()].filter(Boolean);
}

function toProfileResponse(provider) {
  const selectedSubCategories = Array.isArray(provider.serviceSubCategoryIds)
    ? provider.serviceSubCategoryIds
    : [];

  const fallbackSingleSubCategory = provider.serviceSubCategoryId
    ? [provider.serviceSubCategoryId]
    : [];

  const mergedSubCategories = selectedSubCategories.length
    ? selectedSubCategories
    : fallbackSingleSubCategory;

  const serviceSubCategoryIds = mergedSubCategories.map((item) =>
    item?._id ? item._id : item
  );

  const serviceSubCategoryNames = mergedSubCategories.map((item) =>
    item?.name ? item.name : ""
  ).filter(Boolean);

  return {
    id: provider._id,
    name: provider.name,
    email: provider.email,
    phone: provider.phone || "",
    service: provider.service || "",
    serviceCategoryId: provider.serviceCategoryId?._id || null,
    serviceCategoryName: provider.serviceCategoryId?.name || "",
    serviceSubCategoryId: serviceSubCategoryIds[0] || null,
    serviceSubCategoryName: serviceSubCategoryNames[0] || "",
    serviceSubCategoryIds,
    serviceSubCategoryNames,
    location: provider.location || "",
    bio: provider.bio || "",
    yearsExperience: provider.yearsExperience || 0,
    avatar: provider.avatar || "",
    status: provider.status,
    onboardingCompleted: !!provider.onboardingCompleted,
  };
}

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
      .populate("serviceSubCategoryId", "name category_id")
      .populate("serviceSubCategoryIds", "name category_id");

    return res.json({
      success: true,
      data: toProfileResponse(provider),
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
      serviceSubCategoryIds,
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
    const hasSubCategoryIdsField = Object.prototype.hasOwnProperty.call(
      req.body,
      "serviceSubCategoryIds"
    );
    const hasSingleSubCategoryField = Object.prototype.hasOwnProperty.call(
      req.body,
      "serviceSubCategoryId"
    );

    let requestedSubCategoryIds = [];
    if (hasSubCategoryIdsField) {
      requestedSubCategoryIds = normalizeObjectIdArray(serviceSubCategoryIds);
    } else if (hasSingleSubCategoryField) {
      requestedSubCategoryIds = normalizeObjectIdArray(serviceSubCategoryId);
    }

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

    if (hasSubCategoryIdsField || hasSingleSubCategoryField) {
      if (requestedSubCategoryIds.length === 0) {
        updates.serviceSubCategoryIds = [];
        updates.serviceSubCategoryId = null;
      } else {
        const subQuery = {
          _id: { $in: requestedSubCategoryIds },
          status: { $in: ["active", "ACTIVE"] },
          ...notDeletedQuery,
        };

        if (selectedCategory?._id) {
          subQuery.category_id = selectedCategory._id;
        }

        const selectedSubCategories = await SubCategory.find(subQuery).select(
          "_id name category_id"
        );

        const selectedSubCategoryIdSet = new Set(
          selectedSubCategories.map((item) => String(item._id))
        );

        const uniqueRequestedIds = [...new Set(requestedSubCategoryIds)];
        const allValid = uniqueRequestedIds.every((id) =>
          selectedSubCategoryIdSet.has(String(id))
        );

        if (!allValid || selectedSubCategories.length === 0) {
          return res.status(400).json({ message: "Invalid sub-category selection" });
        }

        updates.serviceSubCategoryIds = selectedSubCategories.map((item) => item._id);
        updates.serviceSubCategoryId = selectedSubCategories[0]._id;

        if (!selectedCategory?._id) {
          updates.serviceCategoryId = selectedSubCategories[0].category_id;
        }

        updates.service = selectedSubCategories.map((item) => item.name).join(", ");
      }
    } else if (serviceSubCategoryId === "" || serviceSubCategoryId === null) {
      updates.serviceSubCategoryId = null;
    }

    if (!updates.service && selectedCategory?.name) {
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
      .populate("serviceSubCategoryId", "name")
      .populate("serviceSubCategoryIds", "name category_id");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: toProfileResponse(provider),
    });
  } catch (error) {
    console.error("Update provider profile error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

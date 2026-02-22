const Category = require("../models/Category");

/**
 * GET /api/categories
 * Public – return only ACTIVE categories
 */
exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      status: "ACTIVE",
      deletedAt: null,
    })
      .select("_id name slug")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Public categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

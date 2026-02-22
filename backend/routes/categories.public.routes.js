const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

/**
 * BASE PATH:
 * /api/categories
 *
 * PUBLIC — used by:
 * - Provider onboarding
 * - Customer app
 */

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({
      // ✅ handle both ACTIVE & active
      status: { $in: ["ACTIVE", "active"] },

      // ✅ handle both deletedAt & deleted_at
      $or: [{ deletedAt: null }, { deleted_at: null }],
    })
      .select("_id name")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Public categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load categories",
    });
  }
});

module.exports = router;

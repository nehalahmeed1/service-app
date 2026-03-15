const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

const CACHE_TTL_MS = Number(process.env.PUBLIC_CATEGORY_CACHE_TTL_MS || 30000);

let categoriesCache = {
  expiresAt: 0,
  data: null,
};

let categoriesInFlight = null;

function isCacheFresh(entry) {
  return entry && entry.data && Date.now() < entry.expiresAt;
}

async function fetchCategories() {
  const categories = await Category.find({
    status: { $in: ["ACTIVE", "active"] },
    deleted_at: null,
  })
    .select("_id name slug businessLevel pricingModel pricingUnitType pricingRate")
    .sort({ name: 1 })
    .lean();

  categoriesCache = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data: categories,
  };

  return categories;
}

/**
 * BASE PATH:
 * /api/categories
 *
 * PUBLIC - used by onboarding and customer app
 */
router.get("/", async (req, res) => {
  try {
    if (isCacheFresh(categoriesCache)) {
      res.set("X-Cache", "HIT");
      return res.json({
        success: true,
        data: categoriesCache.data,
      });
    }

    if (!categoriesInFlight) {
      categoriesInFlight = fetchCategories().finally(() => {
        categoriesInFlight = null;
      });
    }

    const categories = await categoriesInFlight;

    res.set("X-Cache", "MISS");
    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Public categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load categories",
    });
  }
});

module.exports = router;

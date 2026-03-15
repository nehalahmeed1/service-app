const express = require("express");
const router = express.Router();
const SubCategory = require("../models/SubCategory");

const CACHE_TTL_MS = Number(process.env.PUBLIC_SUBCATEGORY_CACHE_TTL_MS || 30000);

const subCategoryCache = new Map();
const subCategoryInFlight = new Map();

function getCacheKey(categoryId) {
  return categoryId ? `cat:${categoryId}` : "all";
}

function readCache(key) {
  const entry = subCategoryCache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    subCategoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key, data) {
  subCategoryCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function fetchSubCategories(categoryId) {
  const query = {
    status: { $in: ["ACTIVE", "active"] },
    deleted_at: null,
  };

  if (categoryId) {
    query.category_id = categoryId;
  }

  return SubCategory.find(query)
    .populate("category_id", "_id name slug")
    .select("_id name slug category_id basePrice pricingModel pricingUnitType pricingRate")
    .sort({ name: 1 })
    .lean();
}

/**
 * BASE PATH:
 * /api/sub-categories
 *
 * Query params:
 * - categoryId (optional)
 */
router.get("/", async (req, res) => {
  try {
    const categoryId = String(req.query.categoryId || "").trim();
    const cacheKey = getCacheKey(categoryId);
    const cached = readCache(cacheKey);

    if (cached) {
      res.set("X-Cache", "HIT");
      return res.json({
        success: true,
        data: cached,
      });
    }

    if (!subCategoryInFlight.has(cacheKey)) {
      const pending = fetchSubCategories(categoryId)
        .then((rows) => {
          writeCache(cacheKey, rows);
          return rows;
        })
        .finally(() => {
          subCategoryInFlight.delete(cacheKey);
        });

      subCategoryInFlight.set(cacheKey, pending);
    }

    const subCategories = await subCategoryInFlight.get(cacheKey);

    res.set("X-Cache", "MISS");
    return res.json({
      success: true,
      data: subCategories,
    });
  } catch (error) {
    console.error("Public sub-categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load sub-categories",
    });
  }
});

module.exports = router;

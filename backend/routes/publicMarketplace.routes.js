const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

const notDeletedQuery = {
  $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
};

/**
 * BASE PATH:
 * /api/public/marketplace
 */
router.get("/stats", async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayCompleted, totals] = await Promise.all([
      Booking.countDocuments({
        status: "COMPLETED",
        updatedAt: { $gte: todayStart, $lte: todayEnd },
      }),
      Booking.aggregate([
        {
          $match: {
            status: { $in: ["COMPLETED", "CANCELLED", "REJECTED"] },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const completed = totals.find((x) => x._id === "COMPLETED")?.count || 0;
    const cancelled = totals.find((x) => x._id === "CANCELLED")?.count || 0;
    const rejected = totals.find((x) => x._id === "REJECTED")?.count || 0;

    const closed = completed + cancelled + rejected;
    const completionRate = closed > 0 ? completed / closed : 0;
    const avgRating = Math.max(3.8, Math.min(4.9, 3.8 + completionRate * 1.1));

    return res.json({
      success: true,
      data: {
        avgRating: Number(avgRating.toFixed(1)),
        totalJobsDone: completed,
        jobsDoneToday: todayCompleted,
      },
    });
  } catch (error) {
    console.error("Public marketplace stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load marketplace stats",
    });
  }
});

router.get("/home-data", async (req, res) => {
  try {
    const activeCategories = await Category.find({
      status: { $in: ["active", "ACTIVE"] },
      ...notDeletedQuery,
    })
      .select("_id name slug businessLevel")
      .sort({ name: 1 })
      .lean();

    const categoryIds = activeCategories.map((item) => item._id);

    const [subCategories, bookingCounts] = await Promise.all([
      SubCategory.find({
        status: { $in: ["active", "ACTIVE"] },
        category_id: { $in: categoryIds },
        ...notDeletedQuery,
      })
        .select("_id name slug basePrice category_id")
        .sort({ name: 1 })
        .lean(),
      Booking.aggregate([
        {
          $match: {
            status: "COMPLETED",
            subCategoryId: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$subCategoryId",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const bookingMap = new Map(
      bookingCounts.map((item) => [String(item._id), item.count])
    );
    const categoryMap = new Map(
      activeCategories.map((item) => [String(item._id), item])
    );

    const serviceRows = subCategories.map((item) => {
      const category = categoryMap.get(String(item.category_id));
      return {
        id: item._id,
        name: item.name,
        slug: item.slug,
        basePrice: Number(item.basePrice || 0),
        categoryId: category?._id || item.category_id,
        categoryName: category?.name || "",
        categorySlug: category?.slug || "",
        businessLevel: category?.businessLevel || "INDIVIDUAL",
        bookings: bookingMap.get(String(item._id)) || 0,
      };
    });

    const sections = activeCategories
      .map((category) => {
        const services = serviceRows
          .filter((item) => String(item.categoryId) === String(category._id))
          .sort((a, b) => b.bookings - a.bookings || a.name.localeCompare(b.name))
          .slice(0, 12);

        return {
          id: category._id,
          name: category.name,
          slug: category.slug,
          businessLevel: category.businessLevel || "INDIVIDUAL",
          services,
        };
      })
      .filter((section) => section.services.length > 0)
      .slice(0, 6);

    const mostBooked = [...serviceRows]
      .sort((a, b) => b.bookings - a.bookings || a.name.localeCompare(b.name))
      .slice(0, 12);

    return res.json({
      success: true,
      data: {
        sections,
        mostBooked,
      },
    });
  } catch (error) {
    console.error("Public marketplace home data error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load marketplace home data",
    });
  }
});

module.exports = router;

const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");

/**
 * ADMIN DASHBOARD STATS
 * SAFE VERSION – uses ONLY existing models
 */
exports.getAdminDashboardStats = async (req, res) => {
  try {
    // =======================
    // COUNTS (REAL DATA)
    // =======================
    const totalCategories = await Category.countDocuments({
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    });

    const totalSubCategories = await SubCategory.countDocuments({
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    });

    // =======================
    // RESPONSE (MVP SAFE)
    // =======================
    res.json({
      kpis: {
        totalBookings: 0,          // placeholder
        totalRevenue: 0,           // placeholder
        activeProviders: 0,        // placeholder
        activeCustomers: 0,        // placeholder
        totalCategories,
        totalSubCategories,
      },

      jobStatus: [
        { _id: "pending", count: 0 },
        { _id: "in_progress", count: 0 },
        { _id: "completed", count: 0 },
        { _id: "cancelled", count: 0 },
      ],

      alerts: {
        pendingProviders: 0,
        pendingCategoryChanges: 0,
        failedPayments: 0,
      },

      recentActivity: [],      // ready for future
      topCategories: [],       // ready for future
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

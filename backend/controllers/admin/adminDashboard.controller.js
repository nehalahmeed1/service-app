const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");

/**
 * ADMIN DASHBOARD STATS
 * Safe version (no missing models)
 */
exports.getAdminDashboardStats = async (req, res) => {
  try {
    // =======================
    // KPIs (ONLY EXISTING DATA)
    // =======================
    const totalCategories = await Category.countDocuments({
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    });

    const totalSubCategories = await SubCategory.countDocuments({
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    });

    // =======================
    // PLACEHOLDER DATA (SAFE)
    // =======================
    res.json({
      kpis: {
        totalBookings: 0,
        totalRevenue: 0,
        activeProviders: 0,
        activeCustomers: 0,
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
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

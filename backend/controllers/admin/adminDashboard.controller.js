const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const Booking = require("../../models/Booking");
const Provider = require("../../models/Provider");
const Customer = require("../../models/Customer");

function resolveRangeStart(range) {
  const now = new Date();
  const start = new Date(now);
  if (range === "30d") start.setDate(now.getDate() - 30);
  else if (range === "90d") start.setDate(now.getDate() - 90);
  else start.setDate(now.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * ADMIN DASHBOARD STATS
 * SAFE VERSION – uses ONLY existing models
 */
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const range = req.query?.range || "7d";
    const startDate = resolveRangeStart(range);

    // =======================
    // COUNTS (REAL DATA)
    // =======================
    const [
      totalCategories,
      totalSubCategories,
      totalBookings,
      revenueAgg,
      activeProviders,
      activeCustomers,
      jobStatusAgg,
      trendAgg,
      topCategoriesAgg,
      recentBookings,
      pendingProviders,
    ] = await Promise.all([
      Category.countDocuments({
        $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
      }),
      SubCategory.countDocuments({
        $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
      }),
      Booking.countDocuments({ createdAt: { $gte: startDate } }),
      Booking.aggregate([
        { $match: { status: "COMPLETED", updatedAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
      Provider.countDocuments({
        deletedAt: null,
        status: "APPROVED",
        onboardingCompleted: true,
      }),
      Customer.countDocuments({
        deletedAt: null,
        status: "ACTIVE",
      }),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            bookings: { $sum: 1 },
            revenue: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$price", 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$categoryId", jobs: { $sum: 1 } } },
        { $sort: { jobs: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
      ]),
      Booking.find({ createdAt: { $gte: startDate } })
        .populate("categoryId", "name")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Provider.countDocuments({ deletedAt: null, status: "PENDING" }),
    ]);

    const byStatus = jobStatusAgg.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const pendingCount =
      (byStatus.BOOKED || 0) + (byStatus.PROVIDER_ASSIGNED || 0);
    const inProgressCount =
      (byStatus.ACCEPTED || 0) +
      (byStatus.ARRIVING || 0) +
      (byStatus.IN_PROGRESS || 0) +
      (byStatus.SERVICE_DONE || 0);
    const completedCount = byStatus.COMPLETED || 0;
    const cancelledCount = byStatus.CANCELLED || 0;

    // =======================
    // RESPONSE (INTEGRATED)
    // =======================
    res.json({
      kpis: {
        totalBookings,
        totalRevenue: revenueAgg?.[0]?.total || 0,
        activeProviders,
        activeCustomers,
        totalCategories,
        totalSubCategories,
      },

      jobStatus: [
        { _id: "pending", count: pendingCount },
        { _id: "in_progress", count: inProgressCount },
        { _id: "completed", count: completedCount },
        { _id: "cancelled", count: cancelledCount },
      ],
      trends: trendAgg.map((row) => ({
        label: row._id,
        bookings: row.bookings,
        revenue: row.revenue,
      })),
      topCategories: topCategoriesAgg.map((row) => ({
        name: row.category?.[0]?.name || "Unknown",
        jobs: row.jobs,
      })),
      recentActivity: recentBookings.map((booking) => ({
        id: booking._id,
        message: `Booking ${booking.status} (${booking.categoryId?.name || "Service"})`,
        time: booking.createdAt,
        status: booking.status,
      })),

      alerts: {
        pendingProviders,
        pendingCategoryChanges: 0,
        failedPayments: 0,
      },
      range,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

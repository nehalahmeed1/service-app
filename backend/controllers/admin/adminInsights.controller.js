const Provider = require("../../models/Provider");
const Customer = require("../../models/Customer");
const AdminAuditLog = require("../../models/AdminAuditLog");
const Admin = require("../../models/Admin");
const Booking = require("../../models/Booking");

const SECTION_KEYS = ["profile", "identity", "address", "work", "bank"];

const CACHE_TTL_MS = Number(process.env.ADMIN_INSIGHTS_CACHE_TTL_MS || 15000);
const insightsCache = new Map();
const insightsInFlight = new Map();

function normalizeQuery(query = {}) {
  return Object.entries(query)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

function readCache(key) {
  const entry = insightsCache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    insightsCache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key, data) {
  insightsCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function getOrBuildCached(key, builder) {
  const cached = readCache(key);
  if (cached) return { data: cached, cache: "HIT" };

  if (!insightsInFlight.has(key)) {
    const pending = Promise.resolve()
      .then(builder)
      .then((data) => {
        writeCache(key, data);
        return data;
      })
      .finally(() => {
        insightsInFlight.delete(key);
      });

    insightsInFlight.set(key, pending);
  }

  const data = await insightsInFlight.get(key);
  return { data, cache: "MISS" };
}

function rangeToDate(range) {
  const now = new Date();
  const date = new Date(now);
  if (range === "7d") {
    date.setDate(now.getDate() - 7);
    return date;
  }
  if (range === "90d") {
    date.setDate(now.getDate() - 90);
    return date;
  }
  date.setDate(now.getDate() - 30);
  return date;
}

exports.getProvidersInsights = async (req, res) => {
  try {
    const { search = "", status = "ALL" } = req.query;
    const cacheKey = `providers:${normalizeQuery({ search, status })}`;

    const { data, cache } = await getOrBuildCached(cacheKey, async () => {
      const filter = { deletedAt: null };
      if (status !== "ALL") {
        filter.status = status;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      const [providers, totals] = await Promise.all([
        Provider.find(filter)
          .sort({ updatedAt: -1 })
          .lean(),
        Provider.aggregate([
          { $match: { deletedAt: null } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const summary = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
        onboardingCompleted: 0,
        activeThisWeek: 0,
      };

      totals.forEach((item) => {
        const key = (item._id || "").toLowerCase();
        if (summary[key] !== undefined) {
          summary[key] = item.count;
        }
        summary.total += item.count;
      });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const rows = providers.map((provider) => {
        const verified = SECTION_KEYS.filter(
          (sectionKey) => provider.verification?.[sectionKey]?.status === "VERIFIED"
        ).length;
        const uploaded = SECTION_KEYS.filter((sectionKey) => {
          const docs = provider.verification?.[sectionKey]?.documents || [];
          return Array.isArray(docs) && docs.length > 0;
        }).length;

        if (provider.onboardingCompleted) summary.onboardingCompleted += 1;
        if (new Date(provider.updatedAt) >= weekAgo) summary.activeThisWeek += 1;

        return {
          _id: provider._id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone || "-",
          service: provider.service || "-",
          location: provider.location || "-",
          status: provider.status || "PENDING",
          onboardingCompleted: !!provider.onboardingCompleted,
          verificationProgress: Math.round((verified / SECTION_KEYS.length) * 100),
          uploadedSections: uploaded,
          approval: provider.approval || {},
          createdAt: provider.createdAt,
          updatedAt: provider.updatedAt,
        };
      });

      return { summary, rows };
    });

    res.set("X-Cache", cache);
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get providers insights error:", error);
    return res.status(500).json({ message: "Failed to load providers insights" });
  }
};

exports.getCustomersInsights = async (req, res) => {
  try {
    const { search = "", status = "ALL" } = req.query;
    const cacheKey = `customers:${normalizeQuery({ search, status })}`;

    const { data, cache } = await getOrBuildCached(cacheKey, async () => {
      const [providerKeys, adminKeys] = await Promise.all([
        Provider.find({ deletedAt: null }, { email: 1, firebaseUid: 1 }).lean(),
        Admin.find({}, { email: 1 }).lean(),
      ]);

      const providerEmails = providerKeys
        .map((item) => (item.email || "").toLowerCase().trim())
        .filter(Boolean);
      const providerFirebaseUids = providerKeys
        .map((item) => (item.firebaseUid || "").trim())
        .filter(Boolean);
      const adminEmails = adminKeys
        .map((item) => (item.email || "").toLowerCase().trim())
        .filter(Boolean);

      const filter = {
        deletedAt: null,
        email: { $nin: [...providerEmails, ...adminEmails] },
        firebaseUid: { $nin: providerFirebaseUids },
      };

      if (status !== "ALL") {
        filter.status = status;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const [customers, totals] = await Promise.all([
        Customer.find(filter)
          .sort({ updatedAt: -1 })
          .lean(),
        Customer.aggregate([
          {
            $match: {
              deletedAt: null,
              email: { $nin: [...providerEmails, ...adminEmails] },
              firebaseUid: { $nin: providerFirebaseUids },
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

      const summary = {
        total: 0,
        active: 0,
        blocked: 0,
        newThisMonth: 0,
      };

      totals.forEach((item) => {
        const key = (item._id || "").toLowerCase();
        if (summary[key] !== undefined) {
          summary[key] = item.count;
        }
        summary.total += item.count;
      });

      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const rows = customers.map((customer) => {
        if (new Date(customer.createdAt) >= monthAgo) {
          summary.newThisMonth += 1;
        }

        return {
          _id: customer._id,
          name: customer.name || "Unnamed Customer",
          email: customer.email,
          status: customer.status || "ACTIVE",
          joinedAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        };
      });

      return { summary, rows };
    });

    res.set("X-Cache", cache);
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get customers insights error:", error);
    return res.status(500).json({ message: "Failed to load customers insights" });
  }
};

exports.getReportsInsights = async (req, res) => {
  try {
    const range = req.query.range || "30d";
    const cacheKey = `reports:${normalizeQuery({ range })}`;

    const { data, cache } = await getOrBuildCached(cacheKey, async () => {
      const startDate = rangeToDate(range);

      const [providerTotals, customerTotals, actions, rejectionReasons, bookingTotals, bookingDaily, bookingCancellations] =
        await Promise.all([
          Provider.aggregate([
            { $match: { deletedAt: null } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ]),
          Customer.aggregate([
            { $match: { deletedAt: null } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ]),
          AdminAuditLog.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  action: "$action",
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.date": 1 } },
          ]),
          AdminAuditLog.aggregate([
            {
              $match: {
                createdAt: { $gte: startDate },
                status: "REJECTED",
                remarks: { $nin: [null, ""] },
              },
            },
            {
              $group: {
                _id: "$remarks",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ]),
          Booking.aggregate([
            { $match: {} },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ]),
          Booking.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                total: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
          Booking.aggregate([
            {
              $match: {
                status: "CANCELLED",
                cancelledAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: {
                  role: "$cancelledByRole",
                  reason: "$cancelReason",
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ]),
        ]);

      const providerStatus = { pending: 0, approved: 0, rejected: 0, suspended: 0 };
      providerTotals.forEach((item) => {
        const key = (item._id || "").toLowerCase();
        if (providerStatus[key] !== undefined) providerStatus[key] = item.count;
      });

      const customerStatus = { active: 0, blocked: 0 };
      customerTotals.forEach((item) => {
        const key = (item._id || "").toLowerCase();
        if (customerStatus[key] !== undefined) customerStatus[key] = item.count;
      });

      const bookingStatus = {
        booked: 0,
        providerAssigned: 0,
        accepted: 0,
        arriving: 0,
        inProgress: 0,
        serviceDone: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0,
      };

      bookingTotals.forEach((item) => {
        if (item._id === "BOOKED") bookingStatus.booked = item.count;
        if (item._id === "PROVIDER_ASSIGNED") bookingStatus.providerAssigned = item.count;
        if (item._id === "ACCEPTED") bookingStatus.accepted = item.count;
        if (item._id === "ARRIVING") bookingStatus.arriving = item.count;
        if (item._id === "IN_PROGRESS") bookingStatus.inProgress = item.count;
        if (item._id === "SERVICE_DONE") bookingStatus.serviceDone = item.count;
        if (item._id === "COMPLETED") bookingStatus.completed = item.count;
        if (item._id === "REJECTED") bookingStatus.rejected = item.count;
        if (item._id === "CANCELLED") bookingStatus.cancelled = item.count;
      });

      const cancellations = {
        byCustomer: bookingCancellations
          .filter((item) => item._id.role === "CUSTOMER")
          .reduce((sum, item) => sum + item.count, 0),
        byProvider: bookingCancellations
          .filter((item) => item._id.role === "PROVIDER")
          .reduce((sum, item) => sum + item.count, 0),
        reasons: bookingCancellations.map((item) => ({
          role: item._id.role || "UNKNOWN",
          reason: item._id.reason || "No reason",
          count: item.count,
        })),
      };

      return {
        range,
        summary: {
          totalProviders:
            providerStatus.pending +
            providerStatus.approved +
            providerStatus.rejected +
            providerStatus.suspended,
          totalCustomers: customerStatus.active + customerStatus.blocked,
          totalApprovalActions: actions.reduce((sum, item) => sum + item.count, 0),
          rejectionEvents: rejectionReasons.reduce((sum, item) => sum + item.count, 0),
          totalBookings: Object.values(bookingStatus).reduce((sum, n) => sum + n, 0),
          bookingsInRange: bookingDaily.reduce((sum, item) => sum + item.total, 0),
          cancelledByCustomer: cancellations.byCustomer,
          cancelledByProvider: cancellations.byProvider,
        },
        providerStatus,
        customerStatus,
        bookingStatus,
        bookingDaily: bookingDaily.map((item) => ({
          date: item._id,
          total: item.total,
        })),
        bookingCancellations: cancellations,
        activityTimeline: actions.map((item) => ({
          date: item._id.date,
          action: item._id.action,
          count: item.count,
        })),
        rejectionReasons: rejectionReasons.map((item) => ({
          reason: item._id,
          count: item.count,
        })),
      };
    });

    res.set("X-Cache", cache);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Get reports insights error:", error);
    return res.status(500).json({ message: "Failed to load reports insights" });
  }
};

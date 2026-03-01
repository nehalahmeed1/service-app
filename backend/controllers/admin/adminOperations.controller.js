const Provider = require("../../models/Provider");
const AdminAuditLog = require("../../models/AdminAuditLog");
const Booking = require("../../models/Booking");

const SECTION_KEYS = ["profile", "identity", "address", "work", "bank"];

const CACHE_TTL_MS = Number(process.env.ADMIN_OPERATIONS_CACHE_TTL_MS || 15000);
const operationsCache = new Map();
const operationsInFlight = new Map();

function normalizeQuery(query = {}) {
  return Object.entries(query)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

function readCache(key) {
  const entry = operationsCache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    operationsCache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key, data) {
  operationsCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function getOrBuildCached(key, builder) {
  const cached = readCache(key);
  if (cached) return { data: cached, cache: "HIT" };

  if (!operationsInFlight.has(key)) {
    const pending = Promise.resolve()
      .then(builder)
      .then((data) => {
        writeCache(key, data);
        return data;
      })
      .finally(() => {
        operationsInFlight.delete(key);
      });

    operationsInFlight.set(key, pending);
  }

  const data = await operationsInFlight.get(key);
  return { data, cache: "MISS" };
}

function buildSectionRequests(provider) {
  const rows = [];
  SECTION_KEYS.forEach((sectionKey) => {
    const section = provider.verification?.[sectionKey] || {};
    const status = section.status || "PENDING";
    const submittedAt = section.submittedAt || section.updatedAt || provider.updatedAt;
    const hasDocuments = Array.isArray(section.documents) && section.documents.length > 0;
    const hasAnyData = hasDocuments || Object.keys(section).length > 0;

    if (!hasAnyData) return;
    if (!["PENDING", "REJECTED"].includes(status)) return;

    const ageHours = Math.max(
      0,
      Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60))
    );
    const priority = ageHours >= 72 ? "HIGH" : ageHours >= 24 ? "MEDIUM" : "LOW";

    rows.push({
      id: `${provider._id}-${sectionKey}`,
      providerId: provider._id,
      providerName: provider.name,
      providerEmail: provider.email,
      section: sectionKey,
      status,
      remarks: section.remarks || "",
      submittedAt,
      lastAction: section.lastAction || "UPDATE",
      priority,
    });
  });
  return rows;
}

exports.getServiceRequests = async (req, res) => {
  try {
    const { search = "", status = "ALL", priority = "ALL" } = req.query;
    const cacheKey = `service-requests:${normalizeQuery({ search, status, priority })}`;

    const { data, cache } = await getOrBuildCached(cacheKey, async () => {
      const providers = await Provider.find({ deletedAt: null }).lean();
      let rows = providers.flatMap(buildSectionRequests);

      if (search) {
        const searchLower = search.toLowerCase();
        rows = rows.filter(
          (row) =>
            row.providerName?.toLowerCase().includes(searchLower) ||
            row.providerEmail?.toLowerCase().includes(searchLower) ||
            row.section?.toLowerCase().includes(searchLower)
        );
      }

      if (status !== "ALL") {
        rows = rows.filter((row) => row.status === status);
      }

      if (priority !== "ALL") {
        rows = rows.filter((row) => row.priority === priority);
      }

      rows.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      const summary = {
        total: rows.length,
        pending: rows.filter((row) => row.status === "PENDING").length,
        rejected: rows.filter((row) => row.status === "REJECTED").length,
        highPriority: rows.filter((row) => row.priority === "HIGH").length,
      };

      return { summary, rows };
    });

    res.set("X-Cache", cache);
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get service requests error:", error);
    return res.status(500).json({ message: "Failed to load service requests" });
  }
};

exports.getPaymentsOverview = async (req, res) => {
  try {
    const { search = "", eligibility = "ALL" } = req.query;
    const cacheKey = `payments:${normalizeQuery({ search, eligibility })}`;

    const { data, cache } = await getOrBuildCached(cacheKey, async () => {
      const providers = await Provider.find({ deletedAt: null }).lean();

      let rows = providers.map((provider) => {
        const bankStatus = provider.verification?.bank?.status || "PENDING";
        const identityStatus = provider.verification?.identity?.status || "PENDING";
        const addressStatus = provider.verification?.address?.status || "PENDING";
        const approved = provider.status === "APPROVED";

        const eligible =
          approved &&
          bankStatus === "VERIFIED" &&
          identityStatus === "VERIFIED" &&
          addressStatus === "VERIFIED";

        const holdReasons = [];
        if (!approved) holdReasons.push("Provider not approved");
        if (bankStatus !== "VERIFIED") holdReasons.push("Bank not verified");
        if (identityStatus !== "VERIFIED") holdReasons.push("Identity not verified");
        if (addressStatus !== "VERIFIED") holdReasons.push("Address not verified");

        return {
          id: provider._id,
          providerId: provider._id,
          providerName: provider.name,
          providerEmail: provider.email,
          providerStatus: provider.status || "PENDING",
          bankStatus,
          eligibility: eligible ? "ELIGIBLE" : "ON_HOLD",
          holdReason: holdReasons.join(", "),
          payoutAmount: 0,
          currency: "INR",
          lastUpdatedAt: provider.updatedAt,
        };
      });

      if (search) {
        const searchLower = search.toLowerCase();
        rows = rows.filter(
          (row) =>
            row.providerName?.toLowerCase().includes(searchLower) ||
            row.providerEmail?.toLowerCase().includes(searchLower)
        );
      }

      if (eligibility !== "ALL") {
        rows = rows.filter((row) => row.eligibility === eligibility);
      }

      rows.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());

      const summary = {
        totalProviders: rows.length,
        eligible: rows.filter((row) => row.eligibility === "ELIGIBLE").length,
        onHold: rows.filter((row) => row.eligibility === "ON_HOLD").length,
        bankVerified: rows.filter((row) => row.bankStatus === "VERIFIED").length,
      };

      return { summary, rows };
    });

    res.set("X-Cache", cache);
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get payments overview error:", error);
    return res.status(500).json({ message: "Failed to load payments overview" });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const {
      action = "ALL",
      status = "ALL",
      search = "",
      dateFrom = "",
      dateTo = "",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (action !== "ALL") query.action = action;
    if (status !== "ALL") query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const date = new Date(dateTo);
        date.setHours(23, 59, 59, 999);
        query.createdAt.$lte = date;
      }
    }

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { section: { $regex: search, $options: "i" } },
        { remarks: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(10, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      AdminAuditLog.countDocuments(query),
      AdminAuditLog.find(query)
        .populate("adminId", "name email role")
        .populate("providerId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const rows = logs.map((log) => ({
      id: log._id,
      action: log.action,
      status: log.status || "-",
      section: log.section || "-",
      remarks: log.remarks || "",
      admin: log.adminId
        ? {
            name: log.adminId.name,
            email: log.adminId.email,
            role: log.adminId.role,
          }
        : null,
      provider: log.providerId
        ? {
            name: log.providerId.name,
            email: log.providerId.email,
          }
        : null,
      createdAt: log.createdAt,
      ipAddress: log.ipAddress || "-",
    }));

    return res.json({
      success: true,
      data: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.max(1, Math.ceil(total / limitNum)),
        },
        rows,
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({ message: "Failed to load audit logs" });
  }
};

exports.getCompletedJobsEvidence = async (req, res) => {
  try {
    const {
      search = "",
      withProofOnly = "true",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      status: "COMPLETED",
    };

    if (withProofOnly === "true") {
      query["completionProofImages.0"] = { $exists: true };
    }

    if (search) {
      query.$or = [
        { packageCode: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(10, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, rows] = await Promise.all([
      Booking.countDocuments(query),
      Booking.find(query)
        .populate("providerId", "name email")
        .populate("customerId", "name email")
        .populate("categoryId", "name")
        .populate("subCategoryId", "name")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const data = rows.map((row) => ({
      id: row._id,
      packageCode: row.packageCode,
      categoryName: row.categoryId?.name || "",
      subCategoryName: row.subCategoryId?.name || "",
      provider: row.providerId
        ? {
            id: row.providerId._id,
            name: row.providerId.name,
            email: row.providerId.email,
          }
        : null,
      customer: row.customerId
        ? {
            id: row.customerId._id,
            name: row.customerId.name,
            email: row.customerId.email,
          }
        : null,
      bookingDate: row.bookingDate,
      timeSlot: row.timeSlot,
      address: row.address,
      price: row.price || 0,
      status: row.status,
      completionProofImages: row.completionProofImages || [],
      completionProofNote: row.completionProofNote || "",
      completedAt: row.updatedAt,
      createdAt: row.createdAt,
    }));

    return res.json({
      success: true,
      data: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.max(1, Math.ceil(total / limitNum)),
        },
        rows: data,
      },
    });
  } catch (error) {
    console.error("Get completed jobs evidence error:", error);
    return res.status(500).json({ message: "Failed to load completed jobs evidence" });
  }
};

const BOOKING_FLOW_TABS = {
  UPCOMING: ["BOOKED", "PROVIDER_ASSIGNED", "ACCEPTED"],
  HISTORICAL: ["COMPLETED", "CANCELLED", "REJECTED"],
  ALERTS_MISSED_ASSIGNMENTS: ["BOOKED"],
  MATCHED_NOT_STARTED: ["PROVIDER_ASSIGNED", "ACCEPTED"],
  STARTED_NOT_COMPLETED: ["ARRIVING", "IN_PROGRESS", "SERVICE_DONE", "PROOF_UPLOADED"],
};

const SLA_RULES = {
  BOOKED: { targetMinutes: 10, breachAfterMinutes: 15, title: "Assignment" },
  PROVIDER_ASSIGNED: { targetMinutes: 0, breachAfterMinutes: 10, title: "Start Delay" },
  ACCEPTED: { targetMinutes: 0, breachAfterMinutes: 10, title: "Start Delay" },
  ARRIVING: { targetMinutes: 90, breachAfterMinutes: 150, title: "Service Duration" },
  IN_PROGRESS: { targetMinutes: 90, breachAfterMinutes: 150, title: "Service Duration" },
  SERVICE_DONE: { targetMinutes: 30, breachAfterMinutes: 60, title: "Completion Closeout" },
  PROOF_UPLOADED: { targetMinutes: 30, breachAfterMinutes: 60, title: "Completion Closeout" },
};

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapTabQuery(baseQuery, tab) {
  const query = { ...baseQuery };
  const statuses = BOOKING_FLOW_TABS[tab] || BOOKING_FLOW_TABS.UPCOMING;
  query.status = { $in: statuses };

  if (tab === "ALERTS_MISSED_ASSIGNMENTS") {
    query.providerId = null;
    query.createdAt = { ...(query.createdAt || {}), $lte: new Date(Date.now() - 15 * 60 * 1000) };
  }

  return query;
}

function deriveCityFromAddress(address = "") {
  const parts = String(address)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!parts.length) return "-";
  if (parts.length === 1) return parts[0];
  return parts[parts.length - 2] || parts[parts.length - 1];
}

function parseScheduledStart(bookingDate = "", timeSlot = "") {
  if (!bookingDate) return null;

  const rawDate = String(bookingDate).trim();
  const startTimeMatch = String(timeSlot || "").match(/(\d{1,2}:\d{2})/);
  const startTime = startTimeMatch ? startTimeMatch[1] : "";

  const withTimeCandidate = startTime ? new Date(`${rawDate} ${startTime}`) : null;
  if (withTimeCandidate && !Number.isNaN(withTimeCandidate.getTime())) {
    return withTimeCandidate;
  }

  const dateOnly = new Date(rawDate);
  if (!Number.isNaN(dateOnly.getTime())) {
    return dateOnly;
  }

  return null;
}

function computeBookingSla(booking) {
  const status = booking?.status || "";

  if (["COMPLETED"].includes(status)) {
    return {
      state: "MET",
      title: "SLA",
      label: "Met",
      overdueMinutes: 0,
      breached: false,
    };
  }

  if (["CANCELLED", "REJECTED"].includes(status)) {
    return {
      state: "CLOSED",
      title: "SLA",
      label: "Closed",
      overdueMinutes: 0,
      breached: false,
    };
  }

  const rule = SLA_RULES[status];
  if (!rule) {
    return {
      state: "N/A",
      title: "SLA",
      label: "N/A",
      overdueMinutes: 0,
      breached: false,
    };
  }

  const now = Date.now();
  const createdAt = new Date(booking.createdAt).getTime();
  const scheduledStart = parseScheduledStart(booking.bookingDate, booking.timeSlot)?.getTime();

  let anchor = createdAt;
  if (["PROVIDER_ASSIGNED", "ACCEPTED"].includes(status) && scheduledStart) {
    anchor = scheduledStart;
  }
  if (["ARRIVING", "IN_PROGRESS", "SERVICE_DONE", "PROOF_UPLOADED"].includes(status)) {
    anchor = scheduledStart || createdAt;
  }

  const targetAt = anchor + rule.targetMinutes * 60 * 1000;
  const breachAt = anchor + rule.breachAfterMinutes * 60 * 1000;

  if (now <= targetAt) {
    return {
      state: "ON_TRACK",
      title: rule.title,
      label: "On Track",
      overdueMinutes: 0,
      breached: false,
      targetAt: new Date(targetAt),
      breachAt: new Date(breachAt),
    };
  }

  const overdueMinutes = Math.max(0, Math.floor((now - targetAt) / (60 * 1000)));
  if (now <= breachAt) {
    return {
      state: "WARNING",
      title: rule.title,
      label: `Warning (+${overdueMinutes}m)`,
      overdueMinutes,
      breached: false,
      targetAt: new Date(targetAt),
      breachAt: new Date(breachAt),
    };
  }

  return {
    state: "BREACHED",
    title: rule.title,
    label: `Breached (+${overdueMinutes}m)`,
    overdueMinutes,
    breached: true,
    targetAt: new Date(targetAt),
    breachAt: new Date(breachAt),
  };
}

function getStatusAt(statusHistory = [], status) {
  return statusHistory.find((item) => item.status === status)?.at || null;
}

function hasReachedStatus(currentStatus = "", allowed = []) {
  return allowed.includes(currentStatus);
}

exports.getBookingsFlow = async (req, res) => {
  try {
    const {
      tab = "UPCOMING",
      status = "ALL",
      city = "ALL",
      search = "",
      dateFrom = "",
      dateTo = "",
      page = 1,
      limit = 20,
    } = req.query;

    const selectedTab = BOOKING_FLOW_TABS[tab] ? tab : "UPCOMING";
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(10, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const baseQuery = {};

    if (dateFrom || dateTo) {
      baseQuery.createdAt = {};
      if (dateFrom) baseQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const d = new Date(dateTo);
        d.setHours(23, 59, 59, 999);
        baseQuery.createdAt.$lte = d;
      }
    }

    if (city && city !== "ALL") {
      baseQuery.address = { $regex: escapeRegex(city), $options: "i" };
    }

    if (search) {
      const rgx = { $regex: escapeRegex(search), $options: "i" };
      baseQuery.$or = [{ packageCode: rgx }, { address: rgx }, { bookingDate: rgx }, { timeSlot: rgx }];
    }

    const tabCounts = {};
    const tabKeys = Object.keys(BOOKING_FLOW_TABS);
    const counts = await Promise.all(
      tabKeys.map((key) => Booking.countDocuments(mapTabQuery(baseQuery, key)))
    );
    tabKeys.forEach((key, idx) => {
      tabCounts[key] = counts[idx];
    });

    const listQuery = mapTabQuery(baseQuery, selectedTab);
    if (status !== "ALL") {
      listQuery.status = status;
    }

    const [total, rows] = await Promise.all([
      Booking.countDocuments(listQuery),
      Booking.find(listQuery)
        .populate("customerId", "name email")
        .populate("providerId", "name phone email")
        .populate("subCategoryId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const dataRows = rows.map((row) => ({
      sla: computeBookingSla(row),
      id: row._id,
      orderId: row.packageCode || String(row._id).slice(-8),
      bookingType: row.status,
      scheduledDate: row.bookingDate,
      scheduledTime: row.timeSlot,
      createdAt: row.createdAt,
      customerName: row.customerId?.name || "Customer",
      customerEmail: row.customerId?.email || "",
      address: row.address || "-",
      serviceName: row.subCategoryId?.name || row.packageCode || "-",
      workerName: row.providerId?.name || "N/A",
      city: deriveCityFromAddress(row.address || ""),
      status: row.status,
    }));

    const slaSummary = {
      breached: dataRows.filter((row) => row.sla?.state === "BREACHED").length,
      warning: dataRows.filter((row) => row.sla?.state === "WARNING").length,
      onTrack: dataRows.filter((row) => row.sla?.state === "ON_TRACK").length,
    };

    return res.json({
      success: true,
      data: {
        summary: tabCounts,
        slaSummary,
        rows: dataRows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.max(1, Math.ceil(total / limitNum)),
        },
      },
    });
  } catch (error) {
    console.error("Get bookings flow error:", error);
    return res.status(500).json({ message: "Failed to load bookings flow" });
  }
};

exports.getBookingFlowDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("customerId", "name email")
      .populate("providerId", "name phone email")
      .populate("categoryId", "name")
      .populate("subCategoryId", "name")
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const matchedAtFromHistory =
      getStatusAt(booking.statusHistory, "PROVIDER_ASSIGNED") ||
      getStatusAt(booking.statusHistory, "ACCEPTED");

    const startedAtFromHistory =
      getStatusAt(booking.statusHistory, "IN_PROGRESS") ||
      getStatusAt(booking.statusHistory, "ARRIVING") ||
      getStatusAt(booking.statusHistory, "SERVICE_DONE") ||
      getStatusAt(booking.statusHistory, "PROOF_UPLOADED");

    const completedAtFromHistory =
      getStatusAt(booking.statusHistory, "COMPLETED") ||
      getStatusAt(booking.statusHistory, "CANCELLED") ||
      getStatusAt(booking.statusHistory, "REJECTED");

    const matchedAt =
      matchedAtFromHistory ||
      (hasReachedStatus(booking.status, [
        "PROVIDER_ASSIGNED",
        "ACCEPTED",
        "ARRIVING",
        "IN_PROGRESS",
        "SERVICE_DONE",
        "PROOF_UPLOADED",
        "COMPLETED",
      ])
        ? booking.updatedAt
        : null);

    const startedAt =
      startedAtFromHistory ||
      (hasReachedStatus(booking.status, [
        "ARRIVING",
        "IN_PROGRESS",
        "SERVICE_DONE",
        "PROOF_UPLOADED",
        "COMPLETED",
      ])
        ? booking.updatedAt
        : null);

    const completedAt =
      completedAtFromHistory ||
      (hasReachedStatus(booking.status, ["COMPLETED", "CANCELLED", "REJECTED"])
        ? booking.updatedAt
        : null);

    return res.json({
      success: true,
      data: {
        id: booking._id,
        bookingRef: booking.packageCode || String(booking._id),
        type: booking.status,
        status: booking.status,
        scheduledDate: booking.bookingDate,
        scheduledTime: booking.timeSlot,
        price: booking.price || 0,
        address: booking.address || "-",
        categoryName: booking.categoryId?.name || "",
        subCategoryName: booking.subCategoryId?.name || "",
        serviceName: booking.subCategoryId?.name || booking.packageCode || "",
        customer: {
          name: booking.customerId?.name || "Customer",
          email: booking.customerId?.email || "",
        },
        worker: booking.providerId
          ? {
              name: booking.providerId.name || "N/A",
              phone: booking.providerId.phone || "",
              email: booking.providerId.email || "",
            }
          : null,
        sla: computeBookingSla(booking),
        timeline: {
          createdAt: booking.createdAt,
          scheduledAt: `${booking.bookingDate || ""} ${booking.timeSlot || ""}`.trim(),
          matchedAt,
          startedAt,
          completedAt,
        },
        statusHistory: booking.statusHistory || [],
      },
    });
  } catch (error) {
    console.error("Get booking flow details error:", error);
    return res.status(500).json({ message: "Failed to load booking details" });
  }
};

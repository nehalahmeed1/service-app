const Booking = require("../../models/Booking");

function buildProviderServiceScope(provider) {
  const subCategoryIds = [];
  const categoryIds = [];

  if (provider?.serviceSubCategoryId) {
    subCategoryIds.push(provider.serviceSubCategoryId);
  }
  if (provider?.verification?.work?.subCategoryId) {
    subCategoryIds.push(provider.verification.work.subCategoryId);
  }

  if (provider?.serviceCategoryId) {
    categoryIds.push(provider.serviceCategoryId);
  }
  if (provider?.verification?.work?.categoryId) {
    categoryIds.push(provider.verification.work.categoryId);
  }

  const or = [];
  if (subCategoryIds.length) {
    or.push({ subCategoryId: { $in: subCategoryIds } });
  }
  if (categoryIds.length) {
    or.push({ categoryId: { $in: categoryIds } });
  }

  return or.length ? { $or: or } : {};
}

function serializeBooking(booking) {
  return {
    id: booking._id,
    customerName: booking.customerId?.name || "Customer",
    customerEmail: booking.customerId?.email || "",
    serviceName: booking.subCategoryId?.name || booking.packageCode,
    categoryName: booking.categoryId?.name || "",
    date: booking.bookingDate,
    time: booking.timeSlot,
    address: booking.address,
    status: booking.status,
    price: booking.price || 0,
    completionProofImages: booking.completionProofImages || [],
    completionProofNote: booking.completionProofNote || "",
    statusHistory: (booking.statusHistory || []).map((item) => ({
      status: item.status,
      note: item.note || "",
      at: item.at,
    })),
    createdAt: booking.createdAt,
  };
}

exports.getIncomingRequests = async (req, res) => {
  try {
    const serviceScope = buildProviderServiceScope(req.provider);
    const rows = await Booking.find({
      providerId: req.provider._id,
      status: { $in: ["PROVIDER_ASSIGNED"] },
      ...serviceScope,
    })
      .populate("customerId", "name email")
      .populate("categoryId", "name")
      .populate("subCategoryId", "name slug")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: rows.map(serializeBooking),
    });
  } catch (error) {
    console.error("Get incoming requests error:", error);
    return res.status(500).json({ message: "Failed to load requests" });
  }
};

exports.getProviderJobs = async (req, res) => {
  try {
    const serviceScope = buildProviderServiceScope(req.provider);
    const rows = await Booking.find({
      providerId: req.provider._id,
      status: {
        $in: [
          "ACCEPTED",
          "ARRIVING",
          "IN_PROGRESS",
          "SERVICE_DONE",
          "PROOF_UPLOADED",
          "COMPLETED",
        ],
      },
      ...serviceScope,
    })
      .populate("customerId", "name email")
      .populate("categoryId", "name")
      .populate("subCategoryId", "name slug")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: rows.map(serializeBooking),
    });
  } catch (error) {
    console.error("Get provider jobs error:", error);
    return res.status(500).json({ message: "Failed to load jobs" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, note = "" } = req.body;

    const allowed = [
      "ACCEPTED",
      "REJECTED",
      "ARRIVING",
      "IN_PROGRESS",
      "SERVICE_DONE",
      "COMPLETED",
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      providerId: req.provider._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const transitions = {
      PROVIDER_ASSIGNED: ["ACCEPTED", "REJECTED"],
      ACCEPTED: ["ARRIVING"],
      ARRIVING: ["IN_PROGRESS"],
      IN_PROGRESS: ["SERVICE_DONE"],
      SERVICE_DONE: [],
      PROOF_UPLOADED: ["COMPLETED"],
      REJECTED: [],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowedNext = transitions[booking.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: `Cannot move booking from ${booking.status} to ${status}`,
      });
    }

    booking.status = status;
    booking.statusHistory.push({
      status,
      note: note.trim() || `Updated by provider (${req.provider.email})`,
    });
    await booking.save();

    return res.json({
      success: true,
      data: { id: booking._id, status: booking.status },
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    return res.status(500).json({ message: "Failed to update booking status" });
  }
};

exports.cancelBookingByProvider = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const reason = (req.body?.reason || "").trim();

    const booking = await Booking.findOne({
      _id: bookingId,
      providerId: req.provider._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const cancellable = ["PROVIDER_ASSIGNED", "ACCEPTED", "ARRIVING", "IN_PROGRESS"];
    if (!cancellable.includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot cancel booking in ${booking.status} status`,
      });
    }

    booking.status = "CANCELLED";
    booking.cancelReason = reason || "Cancelled by provider";
    booking.cancelledByRole = "PROVIDER";
    booking.cancelledById = req.provider._id;
    booking.cancelledAt = new Date();
    booking.statusHistory.push({
      status: "CANCELLED",
      note: booking.cancelReason,
    });
    await booking.save();

    return res.json({
      success: true,
      data: { id: booking._id, status: booking.status },
    });
  } catch (error) {
    console.error("Cancel provider booking error:", error);
    return res.status(500).json({ message: "Failed to cancel booking" });
  }
};

exports.uploadCompletionProof = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const note = (req.body?.note || "").trim();
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ message: "Please upload at least one image" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      providerId: req.provider._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!["SERVICE_DONE"].includes(booking.status)) {
      return res.status(400).json({
        message: `Proof can only be uploaded after service done. Current status: ${booking.status}`,
      });
    }

    const uploadedPaths = files.map((file) => `/uploads/booking-proof/${file.filename}`);
    booking.completionProofImages = [...(booking.completionProofImages || []), ...uploadedPaths];
    if (note) {
      booking.completionProofNote = note;
    }

    booking.statusHistory.push({
      status: "PROOF_UPLOADED",
      note: `Completion proof uploaded by provider (${req.provider.email})`,
    });
    booking.status = "PROOF_UPLOADED";

    await booking.save();

    return res.json({
      success: true,
      data: {
        id: booking._id,
        status: booking.status,
        completionProofImages: booking.completionProofImages,
        completionProofNote: booking.completionProofNote,
      },
    });
  } catch (error) {
    console.error("Upload completion proof error:", error);
    return res.status(500).json({ message: "Failed to upload completion proof" });
  }
};

exports.getProviderBookingStats = async (req, res) => {
  try {
    const serviceScope = buildProviderServiceScope(req.provider);
    const baseMatch = {
      providerId: req.provider._id,
      ...serviceScope,
    };

    const [statusTotals, todayCompleted] = await Promise.all([
      Booking.aggregate([
        { $match: baseMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            ...baseMatch,
            status: "COMPLETED",
            updatedAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        {
          $group: {
            _id: null,
            earnings: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const byStatus = statusTotals.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const openRequests =
      (byStatus.BOOKED || 0) + (byStatus.PROVIDER_ASSIGNED || 0);
    const activeJobs =
      (byStatus.ACCEPTED || 0) +
      (byStatus.ARRIVING || 0) +
      (byStatus.IN_PROGRESS || 0) +
      (byStatus.SERVICE_DONE || 0) +
      (byStatus.PROOF_UPLOADED || 0);
    const completedJobs = byStatus.COMPLETED || 0;
    const cancelledJobs = byStatus.CANCELLED || 0;
    const rejectedJobs = byStatus.REJECTED || 0;

    const closedTotal = completedJobs + cancelledJobs + rejectedJobs;
    const completionRate =
      closedTotal > 0 ? Math.round((completedJobs / closedTotal) * 100) : 0;

    return res.json({
      success: true,
      data: {
        openRequests,
        activeJobs,
        completedJobs,
        cancelledJobs,
        rejectedJobs,
        completionRate,
        todayEarnings: todayCompleted?.[0]?.earnings || 0,
        todayCompletedCount: todayCompleted?.[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("Get provider booking stats error:", error);
    return res.status(500).json({ message: "Failed to load booking stats" });
  }
};

const Booking = require("../../models/Booking");
const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const Provider = require("../../models/Provider");
const mongoose = require("mongoose");

const notDeletedQuery = {
  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
};

async function resolveProvider(categoryId, subCategoryId) {
  const baseQuery = {
    status: "APPROVED",
    onboardingCompleted: true,
    deletedAt: null,
  };

  let provider = await Provider.findOne({
    ...baseQuery,
    $or: [
      { serviceSubCategoryId: subCategoryId },
      { serviceSubCategoryIds: subCategoryId },
      { "verification.work.subCategoryId": String(subCategoryId) },
    ],
  })
    .sort({ updatedAt: -1 })
    .select("_id");

  if (provider) return provider._id;

  provider = await Provider.findOne({
    ...baseQuery,
    $or: [
      { serviceCategoryId: categoryId },
      { "verification.work.categoryId": String(categoryId) },
    ],
  })
    .sort({ updatedAt: -1 })
    .select("_id");

  return provider?._id || null;
}

function buildPriceBreakdown(inputPrice, rawBreakdown = {}) {
  const hasBreakdown =
    rawBreakdown &&
    typeof rawBreakdown === "object" &&
    Number(rawBreakdown.total || 0) > 0;

  if (hasBreakdown) {
    return {
      basePrice: Number(rawBreakdown.basePrice || 0),
      platformFee: Number(rawBreakdown.platformFee || 0),
      tax: Number(rawBreakdown.tax || 0),
      total: Number(rawBreakdown.total || 0),
      currency: String(rawBreakdown.currency || "INR"),
    };
  }

  const basePrice = Math.max(0, Number(inputPrice || 0));
  const platformFee = Math.round(basePrice * 0.05);
  const tax = Math.round((basePrice + platformFee) * 0.18);
  const total = basePrice + platformFee + tax;

  return {
    basePrice,
    platformFee,
    tax,
    total,
    currency: "INR",
  };
}

function toSafeString(value) {
  return String(value || "").trim();
}

function toSafeNonNegativeInt(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function toSafePositiveInt(value, fallback = 1) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) return fallback;
  return Math.floor(num);
}

function toSafeNonNegativeNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Number(num);
}

function buildBookingContext(rawContext = {}) {
  const level = toSafeString(rawContext.businessLevel).toUpperCase();
  const businessLevel = ["INDIVIDUAL", "SMALL_TEAM", "ENTERPRISE"].includes(level)
    ? level
    : "INDIVIDUAL";

  return {
    businessLevel,
    landmark: toSafeString(rawContext.landmark),
    specialInstructions: toSafeString(rawContext.specialInstructions),
    serviceMetrics: {
      pricingModel: ["STANDARD", "QUANTITY_BASED", "AREA_BASED"].includes(
        toSafeString(rawContext?.serviceMetrics?.pricingModel).toUpperCase()
      )
        ? toSafeString(rawContext?.serviceMetrics?.pricingModel).toUpperCase()
        : "STANDARD",
      quantity: toSafePositiveInt(rawContext?.serviceMetrics?.quantity, 1),
      areaSqft: toSafeNonNegativeNumber(rawContext?.serviceMetrics?.areaSqft),
      ratePerUnit: toSafeNonNegativeNumber(rawContext?.serviceMetrics?.ratePerUnit),
      unitType: toSafeString(rawContext?.serviceMetrics?.unitType).toUpperCase() === "SQFT"
        ? "SQFT"
        : "UNIT",
    },
    smallTeam: {
      teamName: toSafeString(rawContext?.smallTeam?.teamName),
      coordinator: toSafeString(rawContext?.smallTeam?.coordinator),
      requestsPerMonth: toSafeNonNegativeInt(rawContext?.smallTeam?.requestsPerMonth),
      preferredWindow: toSafeString(rawContext?.smallTeam?.preferredWindow),
    },
    enterprise: {
      companyName: toSafeString(rawContext?.enterprise?.companyName),
      facilityType: toSafeString(rawContext?.enterprise?.facilityType),
      facilityCount: toSafeNonNegativeInt(rawContext?.enterprise?.facilityCount),
      coordinator: toSafeString(rawContext?.enterprise?.coordinator),
      poNumber: toSafeString(rawContext?.enterprise?.poNumber),
      complianceChecklistRequired: Boolean(rawContext?.enterprise?.complianceChecklistRequired),
    },
  };
}

async function isProviderSlotLocked({ providerId, bookingDate, timeSlot, excludeBookingId = null }) {
  if (!providerId) return false;

  const query = {
    providerId,
    bookingDate,
    timeSlot,
    status: {
      $in: [
        "PROVIDER_ASSIGNED",
        "ACCEPTED",
        "ARRIVING",
        "IN_PROGRESS",
        "SERVICE_DONE",
        "PROOF_UPLOADED",
      ],
    },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.exists(query);
  return Boolean(conflict);
}

exports.createBooking = async (req, res) => {
  try {
    const customer = req.customer;
    const {
      categorySlug,
      subCategoryRef,
      serviceSlug,
      packageCode,
      bookingDate,
      timeSlot,
      address,
      price,
      priceBreakdown,
      bookingContext,
    } = req.body;

    const selectedSubCategoryRef = subCategoryRef || serviceSlug;
    if (!selectedSubCategoryRef || !bookingDate || !timeSlot || !address) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    let selectedCategory = null;
    if (categorySlug) {
      selectedCategory = await Category.findOne({
        $or: [{ slug: categorySlug }, { _id: categorySlug }],
        status: "active",
        ...notDeletedQuery,
      }).select("_id name businessLevel");

      if (!selectedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    let subCategory = null;
    if (mongoose.Types.ObjectId.isValid(selectedSubCategoryRef)) {
      subCategory = await SubCategory.findOne({
        _id: selectedSubCategoryRef,
        status: "active",
        ...notDeletedQuery,
      }).select("_id category_id name slug");
    } else {
      if (selectedCategory?._id) {
        subCategory = await SubCategory.findOne({
          slug: selectedSubCategoryRef,
          category_id: selectedCategory._id,
          status: "active",
          ...notDeletedQuery,
        }).select("_id category_id name slug");
      }
      if (!subCategory) {
        subCategory = await SubCategory.findOne({
          slug: selectedSubCategoryRef,
          status: "active",
          ...notDeletedQuery,
        }).select("_id category_id name slug");
      }
    }

    if (!subCategory) {
      return res.status(404).json({ message: "Service not found" });
    }

    const category =
      selectedCategory ||
      (await Category.findOne({
        _id: subCategory.category_id,
        status: "active",
        ...notDeletedQuery,
      }).select("_id name businessLevel"));

    let providerId = await resolveProvider(category._id, subCategory._id);
    const slotLocked = await isProviderSlotLocked({
      providerId,
      bookingDate,
      timeSlot,
    });

    if (slotLocked) {
      providerId = null;
    }

    const initialStatus = providerId ? "PROVIDER_ASSIGNED" : "BOOKED";
    const computedBreakdown = buildPriceBreakdown(price, priceBreakdown);
    const computedContext = buildBookingContext(bookingContext);
    computedContext.businessLevel = category?.businessLevel || computedContext.businessLevel;

    if (computedContext.serviceMetrics?.pricingModel === "AREA_BASED") {
      if (computedContext.serviceMetrics.areaSqft <= 0) {
        return res.status(400).json({
          message: "Area in sq ft is required for area-based pricing",
        });
      }
    }

    if (computedContext.serviceMetrics?.pricingModel === "QUANTITY_BASED") {
      if (computedContext.serviceMetrics.quantity < 1) {
        return res.status(400).json({
          message: "Quantity must be at least 1 for quantity-based pricing",
        });
      }
    }

    if (
      computedContext.businessLevel === "SMALL_TEAM" &&
      (!computedContext.smallTeam.teamName || !computedContext.smallTeam.coordinator)
    ) {
      return res.status(400).json({
        message: "Team name and coordinator are required for SMALL_TEAM bookings",
      });
    }
    if (
      computedContext.businessLevel === "ENTERPRISE" &&
      (!computedContext.enterprise.companyName ||
        !computedContext.enterprise.facilityType ||
        !computedContext.enterprise.coordinator)
    ) {
      return res.status(400).json({
        message: "Company, facility type and coordinator are required for ENTERPRISE bookings",
      });
    }

    const booking = await Booking.create({
      customerId: customer._id,
      providerId,
      categoryId: category._id,
      subCategoryId: subCategory._id,
      packageCode: packageCode || subCategory.slug || selectedSubCategoryRef,
      bookingDate,
      timeSlot,
      address,
      price: computedBreakdown.total,
      priceBreakdown: computedBreakdown,
      bookingContext: computedContext,
      status: initialStatus,
      statusHistory: [
        { status: "BOOKED", note: "Booking created by customer" },
        ...(providerId
          ? [{ status: "PROVIDER_ASSIGNED", note: "Provider assigned" }]
          : [
              slotLocked
                ? {
                    status: "BOOKED",
                    note: "Slot busy for matched provider, moved to unassigned queue",
                  }
                : null,
            ].filter(Boolean)),
      ],
    });

    return res.status(201).json({
      success: true,
      data: {
        id: booking._id,
        status: booking.status,
        providerAssigned: !!providerId,
        slotLocked,
        priceBreakdown: booking.priceBreakdown,
        bookingContext: booking.bookingContext,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({ message: "Failed to create booking" });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    const rows = await Booking.find({ customerId: req.customer._id })
      .populate("providerId", "name email phone")
      .populate("categoryId", "name")
      .populate("subCategoryId", "name slug")
      .sort({ createdAt: -1 });

    const data = rows.map((booking) => ({
      id: booking._id,
      serviceName: booking.subCategoryId?.name || booking.packageCode,
      categoryName: booking.categoryId?.name || "",
      provider: booking.providerId
        ? {
            id: booking.providerId._id,
            name: booking.providerId.name || "Provider",
            email: booking.providerId.email || "",
            phone: booking.providerId.phone || "",
          }
        : null,
      date: booking.bookingDate,
      time: booking.timeSlot,
      address: booking.address,
      bookingContext: booking.bookingContext || {
        businessLevel: "INDIVIDUAL",
        landmark: "",
        specialInstructions: "",
        serviceMetrics: {
          pricingModel: "STANDARD",
          quantity: 1,
          areaSqft: 0,
          ratePerUnit: 0,
          unitType: "UNIT",
        },
        smallTeam: {
          teamName: "",
          coordinator: "",
          requestsPerMonth: 0,
          preferredWindow: "",
        },
        enterprise: {
          companyName: "",
          facilityType: "",
          facilityCount: 0,
          coordinator: "",
          poNumber: "",
          complianceChecklistRequired: false,
        },
      },
      price: booking.price || 0,
      priceBreakdown: booking.priceBreakdown || {
        basePrice: booking.price || 0,
        platformFee: 0,
        tax: 0,
        total: booking.price || 0,
        currency: "INR",
      },
      status: booking.status,
      paymentStatus: booking.paymentStatus || "UNPAID",
      paidAt: booking.paidAt,
      payment: {
        method: booking.payment?.method || "",
        requestedAmount: Number(booking.payment?.requestedAmount || booking.priceBreakdown?.total || booking.price || 0),
        currency: booking.payment?.currency || booking.priceBreakdown?.currency || "INR",
        customerReference: booking.payment?.customerReference || "",
        customerPaidAt: booking.payment?.customerPaidAt || null,
        submittedAt: booking.payment?.submittedAt || null,
        verificationStatus: booking.payment?.verificationStatus || "NOT_SUBMITTED",
        verificationNote: booking.payment?.verificationNote || "",
        verifiedAt: booking.payment?.verifiedAt || null,
      },
      reviewStatus: booking.reviewStatus || "PENDING",
      review: booking.review || null,
      cancelReason: booking.cancelReason || "",
      cancelledByRole: booking.cancelledByRole || "",
      cancelledAt: booking.cancelledAt,
      rescheduleHistory: booking.rescheduleHistory || [],
      disputes: booking.disputes || [],
      completionProofImages: booking.completionProofImages || [],
      completionProofNote: booking.completionProofNote || "",
      statusHistory: (booking.statusHistory || []).map((item) => ({
        status: item.status,
        note: item.note || "",
        at: item.at,
      })),
      createdAt: booking.createdAt,
    }));

    return res.json({ success: true, data });
  } catch (error) {
    console.error("Get customer bookings error:", error);
    return res.status(500).json({ message: "Failed to load bookings" });
  }
};

exports.submitCustomerPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const method = String(req.body?.method || "UPI").trim().toUpperCase();
    const customerReference = String(req.body?.reference || "").trim();
    const customerPaidAtInput = req.body?.paidAt ? new Date(req.body.paidAt) : new Date();
    const requestedAmount = Number(req.body?.amount || 0);

    const allowedMethods = ["UPI", "CARD", "NET_BANKING", "WALLET", "CASH"];
    if (!allowedMethods.includes(method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (!customerReference) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.customer._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!["PROOF_UPLOADED", "COMPLETED"].includes(booking.status)) {
      return res.status(400).json({
        message: "Payment is allowed only after service proof upload or completion",
      });
    }

    if (["PAID", "REFUNDED", "PARTIALLY_REFUNDED"].includes(booking.paymentStatus)) {
      return res.status(400).json({ message: "Payment already finalized for this booking" });
    }

    const payableAmount = Number(booking?.priceBreakdown?.total || booking.price || 0);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return res.status(400).json({ message: "Valid payment amount is required" });
    }

    if (Math.abs(requestedAmount - payableAmount) > 1) {
      return res.status(400).json({
        message: `Payment amount must match payable amount (Rs ${payableAmount})`,
      });
    }

    booking.paymentStatus = "PAYMENT_PENDING";
    booking.paymentReference = customerReference;
    booking.payment = {
      ...booking.payment,
      method,
      requestedAmount,
      currency: booking?.priceBreakdown?.currency || "INR",
      customerReference,
      customerPaidAt: customerPaidAtInput,
      submittedAt: new Date(),
      verificationStatus: "PENDING",
      verificationNote: "",
      verifiedBy: null,
      verifiedAt: null,
    };
    booking.statusHistory.push({
      status: "PAYMENT_PENDING",
      note: `Payment submitted by customer (${method}${customerReference ? ` | ${customerReference}` : ""})`,
    });

    await booking.save();

    return res.json({
      success: true,
      data: {
        id: booking._id,
        paymentStatus: booking.paymentStatus,
        paymentReference: booking.paymentReference,
        payment: {
          method: booking.payment?.method || "",
          requestedAmount: booking.payment?.requestedAmount || payableAmount,
          currency: booking.payment?.currency || "INR",
          customerReference: booking.payment?.customerReference || "",
          customerPaidAt: booking.payment?.customerPaidAt || null,
          submittedAt: booking.payment?.submittedAt || null,
          verificationStatus: booking.payment?.verificationStatus || "PENDING",
        },
      },
    });
  } catch (error) {
    console.error("Submit customer payment error:", error);
    return res.status(500).json({ message: "Failed to submit payment details" });
  }
};

exports.cancelCustomerBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const reason = (req.body?.reason || "").trim();

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.customer._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const cancellable = ["BOOKED", "PROVIDER_ASSIGNED", "ACCEPTED", "ARRIVING"];
    if (!cancellable.includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot cancel booking in ${booking.status} status`,
      });
    }

    booking.status = "CANCELLED";
    booking.cancelReason = reason || "Cancelled by customer";
    booking.cancelledByRole = "CUSTOMER";
    booking.cancelledById = req.customer._id;
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
    console.error("Cancel customer booking error:", error);
    return res.status(500).json({ message: "Failed to cancel booking" });
  }
};

exports.rescheduleCustomerBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const newBookingDate = String(req.body?.bookingDate || "").trim();
    const newTimeSlot = String(req.body?.timeSlot || "").trim();
    const reason = String(req.body?.reason || "").trim();

    if (!newBookingDate || !newTimeSlot) {
      return res.status(400).json({ message: "New booking date and time slot are required" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.customer._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const reschedulable = ["BOOKED", "PROVIDER_ASSIGNED", "ACCEPTED", "ARRIVING"];
    if (!reschedulable.includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot reschedule booking in ${booking.status} status`,
      });
    }

    if (booking.providerId) {
      const slotLocked = await isProviderSlotLocked({
        providerId: booking.providerId,
        bookingDate: newBookingDate,
        timeSlot: newTimeSlot,
        excludeBookingId: booking._id,
      });
      if (slotLocked) {
        return res.status(409).json({
          message: "Selected slot is unavailable for assigned provider. Please choose another slot.",
        });
      }
    }

    booking.rescheduleHistory.push({
      oldBookingDate: booking.bookingDate,
      oldTimeSlot: booking.timeSlot,
      newBookingDate,
      newTimeSlot,
      reason: reason || "Rescheduled by customer",
      requestedByRole: "CUSTOMER",
      requestedById: req.customer._id,
    });

    booking.bookingDate = newBookingDate;
    booking.timeSlot = newTimeSlot;
    booking.statusHistory.push({
      status: "RESCHEDULED",
      note: reason || "Rescheduled by customer",
    });

    await booking.save();

    return res.json({
      success: true,
      data: {
        id: booking._id,
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        rescheduleHistory: booking.rescheduleHistory,
      },
    });
  } catch (error) {
    console.error("Reschedule customer booking error:", error);
    return res.status(500).json({ message: "Failed to reschedule booking" });
  }
};

exports.raiseCustomerDispute = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const reason = String(req.body?.reason || "").trim();
    const details = String(req.body?.details || "").trim();
    const evidenceImages = Array.isArray(req.body?.evidenceImages)
      ? req.body.evidenceImages.filter(Boolean)
      : [];

    if (!reason) {
      return res.status(400).json({ message: "Dispute reason is required" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.customer._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!["PROOF_UPLOADED", "COMPLETED"].includes(booking.status)) {
      return res.status(400).json({
        message: "Dispute can only be raised after service completion proof or completion",
      });
    }

    booking.disputes.push({
      status: "OPEN",
      reason,
      details,
      evidenceImages,
      openedByRole: "CUSTOMER",
      openedById: req.customer._id,
    });

    booking.statusHistory.push({
      status: "DISPUTED",
      note: reason,
    });

    await booking.save();

    return res.json({
      success: true,
      data: {
        id: booking._id,
        disputes: booking.disputes,
      },
    });
  } catch (error) {
    console.error("Raise customer dispute error:", error);
    return res.status(500).json({ message: "Failed to raise dispute" });
  }
};

exports.submitCustomerReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const rating = Number(req.body?.rating || 0);
    const comment = String(req.body?.comment || "").trim();

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.customer._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "COMPLETED") {
      return res.status(400).json({ message: "Review can be submitted only after completion" });
    }

    if (booking.paymentStatus !== "PAID") {
      return res.status(400).json({ message: "Review can be submitted only after payment" });
    }

    if (booking.reviewStatus === "SUBMITTED") {
      return res.status(400).json({ message: "Review already submitted for this booking" });
    }

    booking.reviewStatus = "SUBMITTED";
    booking.review = {
      rating,
      comment,
      submittedAt: new Date(),
    };
    booking.statusHistory.push({
      status: "REVIEW_SUBMITTED",
      note: `Review submitted with rating ${rating}`,
    });

    await booking.save();

    return res.json({
      success: true,
      data: {
        id: booking._id,
        reviewStatus: booking.reviewStatus,
        review: booking.review,
      },
    });
  } catch (error) {
    console.error("Submit customer review error:", error);
    return res.status(500).json({ message: "Failed to submit review" });
  }
};

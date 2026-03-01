const Booking = require("../../models/Booking");
const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const Provider = require("../../models/Provider");
const mongoose = require("mongoose");

const notDeletedQuery = {
  $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
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
      }).select("_id name");

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
      }).select("_id name"));

    const providerId = await resolveProvider(category._id, subCategory._id);

    const initialStatus = providerId ? "PROVIDER_ASSIGNED" : "BOOKED";

    const booking = await Booking.create({
      customerId: customer._id,
      providerId,
      categoryId: category._id,
      subCategoryId: subCategory._id,
      packageCode: packageCode || subCategory.slug || selectedSubCategoryRef,
      bookingDate,
      timeSlot,
      address,
      price: Number(price) || 0,
      status: initialStatus,
      statusHistory: [
        { status: "BOOKED", note: "Booking created by customer" },
        ...(providerId
          ? [{ status: "PROVIDER_ASSIGNED", note: "Provider assigned" }]
          : []),
      ],
    });

    return res.status(201).json({
      success: true,
      data: {
        id: booking._id,
        status: booking.status,
        providerAssigned: !!providerId,
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
      price: booking.price || 0,
      status: booking.status,
      cancelReason: booking.cancelReason || "",
      cancelledByRole: booking.cancelledByRole || "",
      cancelledAt: booking.cancelledAt,
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

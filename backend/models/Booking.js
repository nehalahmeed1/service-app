const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
      index: true,
    },
    packageCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    bookingDate: {
      type: String,
      required: true,
      trim: true,
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceBreakdown: {
      basePrice: { type: Number, default: 0, min: 0 },
      platformFee: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "INR", trim: true },
    },
    bookingContext: {
      businessLevel: {
        type: String,
        enum: ["INDIVIDUAL", "SMALL_TEAM", "ENTERPRISE"],
        default: "INDIVIDUAL",
        index: true,
      },
      landmark: { type: String, default: "", trim: true },
      specialInstructions: { type: String, default: "", trim: true },
      serviceMetrics: {
        pricingModel: {
          type: String,
          enum: ["STANDARD", "QUANTITY_BASED", "AREA_BASED"],
          default: "STANDARD",
        },
        quantity: { type: Number, default: 1, min: 1 },
        areaSqft: { type: Number, default: 0, min: 0 },
        ratePerUnit: { type: Number, default: 0, min: 0 },
        unitType: {
          type: String,
          enum: ["UNIT", "SQFT"],
          default: "UNIT",
        },
      },
      smallTeam: {
        teamName: { type: String, default: "", trim: true },
        coordinator: { type: String, default: "", trim: true },
        requestsPerMonth: { type: Number, default: 0, min: 0 },
        preferredWindow: { type: String, default: "", trim: true },
      },
      enterprise: {
        companyName: { type: String, default: "", trim: true },
        facilityType: { type: String, default: "", trim: true },
        facilityCount: { type: Number, default: 0, min: 0 },
        coordinator: { type: String, default: "", trim: true },
        poNumber: { type: String, default: "", trim: true },
        complianceChecklistRequired: { type: Boolean, default: false },
      },
    },
    status: {
      type: String,
      enum: [
        "BOOKED",
        "PROVIDER_ASSIGNED",
        "ACCEPTED",
        "REJECTED",
        "ARRIVING",
        "IN_PROGRESS",
        "SERVICE_DONE",
        "COMPLETED",
        "PROOF_UPLOADED",
        "CANCELLED",
      ],
      default: "BOOKED",
      index: true,
    },
    completionProofImages: {
      type: [String],
      default: [],
    },
    completionProofNote: {
      type: String,
      default: "",
      trim: true,
    },
    cancelReason: {
      type: String,
      default: "",
      trim: true,
    },
    cancelledByRole: {
      type: String,
      enum: ["CUSTOMER", "PROVIDER", "ADMIN", "SYSTEM", ""],
      default: "",
      index: true,
    },
    cancelledById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: [
        "UNPAID",
        "PAYMENT_PENDING",
        "PAID",
        "PAYMENT_FAILED",
        "PARTIALLY_REFUNDED",
        "REFUNDED",
      ],
      default: "UNPAID",
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },
    payment: {
      method: {
        type: String,
        enum: ["UPI", "CARD", "NET_BANKING", "WALLET", "CASH", ""],
        default: "",
      },
      requestedAmount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "INR", trim: true },
      customerReference: { type: String, default: "", trim: true },
      customerPaidAt: { type: Date, default: null },
      submittedAt: { type: Date, default: null },
      verificationStatus: {
        type: String,
        enum: ["NOT_SUBMITTED", "PENDING", "VERIFIED", "REJECTED"],
        default: "NOT_SUBMITTED",
      },
      verificationNote: { type: String, default: "", trim: true },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
      verifiedAt: { type: Date, default: null },
    },
    reviewStatus: {
      type: String,
      enum: ["PENDING", "SUBMITTED"],
      default: "PENDING",
      index: true,
    },
    review: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: "", trim: true },
      submittedAt: { type: Date, default: null },
    },
    rescheduleHistory: {
      type: [
        {
          oldBookingDate: { type: String, default: "" },
          oldTimeSlot: { type: String, default: "" },
          newBookingDate: { type: String, default: "" },
          newTimeSlot: { type: String, default: "" },
          reason: { type: String, default: "", trim: true },
          requestedByRole: {
            type: String,
            enum: ["CUSTOMER", "PROVIDER", "ADMIN", "SYSTEM", ""],
            default: "",
          },
          requestedById: { type: mongoose.Schema.Types.ObjectId, default: null },
          at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    disputes: {
      type: [
        {
          status: {
            type: String,
            enum: ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"],
            default: "OPEN",
          },
          reason: { type: String, required: true, trim: true },
          details: { type: String, default: "", trim: true },
          evidenceImages: { type: [String], default: [] },
          openedByRole: {
            type: String,
            enum: ["CUSTOMER", "PROVIDER", "ADMIN", "SYSTEM"],
            default: "CUSTOMER",
          },
          openedById: { type: mongoose.Schema.Types.ObjectId, default: null },
          openedAt: { type: Date, default: Date.now },
          resolutionType: {
            type: String,
            enum: ["", "FULL_REFUND", "PARTIAL_REFUND", "RETRY_SERVICE", "REJECTED"],
            default: "",
          },
          resolutionNote: { type: String, default: "", trim: true },
          resolvedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
          resolvedAt: { type: Date, default: null },
        },
      ],
      default: [],
    },
    statusHistory: {
      type: [
        {
          status: {
            type: String,
            required: true,
          },
          note: {
            type: String,
            default: "",
          },
          at: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

bookingSchema.index({ providerId: 1, status: 1, createdAt: -1 });
bookingSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);

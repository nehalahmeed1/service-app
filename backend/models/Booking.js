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

const mongoose = require("mongoose");

/* ================= SUB-SCHEMAS ================= */

const verificationSectionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    remarks: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    verifiedAt: Date,
    documents: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
    // Keep section-specific payloads like aadhaarNumber/address fields.
    strict: false,
  }
);

/* ================= PROVIDER SCHEMA ================= */

const ProviderSchema = new mongoose.Schema(
  {
    // ✅ MongoDB source of truth
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Optional (temporary – for migration only)
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    service: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    yearsExperience: {
      type: Number,
      default: 0,
      min: 0,
    },

    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
      index: true,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    approval: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
      },
      approvedAt: Date,
      rejectionReason: String,
    },

    verification: {
      profile: { type: verificationSectionSchema, default: () => ({}) },
      identity: { type: verificationSectionSchema, default: () => ({}) },
      address: { type: verificationSectionSchema, default: () => ({}) },
      work: { type: verificationSectionSchema, default: () => ({}) },
      bank: { type: verificationSectionSchema, default: () => ({}) },
    },

    deletedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Provider", ProviderSchema);

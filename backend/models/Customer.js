const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    // Firebase Auth reference
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Basic profile
    name: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Account status
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE",
      index: true,
    },

    // Soft delete (audit safe)
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Useful admin queries
CustomerSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Customer", CustomerSchema);

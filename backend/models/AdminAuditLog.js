const mongoose = require("mongoose");

/* ======================================================
   ADMIN AUDIT LOG SCHEMA
   (Legal + Compliance Ready)
====================================================== */

const AdminAuditLogSchema = new mongoose.Schema(
  {
    /* ================= ADMIN ================= */
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    /* ================= ACTION ================= */
    action: {
      type: String,
      required: true,
      index: true,
      /*
        Examples:
        - VERIFY_IDENTITY
        - VERIFY_ADDRESS
        - VERIFY_WORK
        - VERIFY_BANK
        - APPROVE_PROVIDER
        - REJECT_PROVIDER
      */
    },

    /* ================= TARGET ================= */
    targetType: {
      type: String,
      enum: ["PROVIDER"],
      default: "PROVIDER",
      index: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    /* ================= PROVIDER-SPECIFIC ================= */
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      index: true,
    },

    section: {
      type: String,
      enum: ["profile", "identity", "address", "work", "bank"],
      default: null,
    },

    status: {
      type: String,
      enum: ["VERIFIED", "REJECTED", "APPROVED"],
      default: null,
    },

    remarks: {
      type: String,
      default: null,
    },

    /* ================= CONTEXT ================= */
    ipAddress: {
      type: String,
      default: null,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// Fast admin lookups
AdminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ providerId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AdminAuditLog", AdminAuditLogSchema);

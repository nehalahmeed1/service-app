const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true, // ✅ added for faster search
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      immutable: true, // 🔒 slug can NEVER change
      index: true, // ✅ added
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true, // ✅ added for filtering
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // used for nested categories (optional)
      index: true, // ✅ added
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true, // ✅ added
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      index: true, // ✅ added
    },

    deleted_at: {
      type: Date,
      default: null,
      index: true, // ✅ added for soft delete
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);

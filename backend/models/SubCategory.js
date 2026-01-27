const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    // 🔗 Link to parent Category
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // 🏷 Sub-Category Name
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },

    // 🔗 URL-friendly slug
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // ✅ Active / Inactive
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    // 🧾 Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      index: true,
    },

    // 🗑 Soft delete
    deleted_at: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// 🔒 Prevent duplicate sub-category names inside same category
subCategorySchema.index(
  { category_id: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);

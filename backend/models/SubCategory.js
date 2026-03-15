const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    businessLevel: {
      type: String,
      enum: ["INDIVIDUAL", "SMALL_TEAM", "ENTERPRISE"],
      required: true,
      default: "INDIVIDUAL",
      index: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    pricingModel: {
      type: String,
      enum: ["STANDARD", "QUANTITY_BASED", "AREA_BASED"],
      default: "STANDARD",
    },

    pricingUnitType: {
      type: String,
      enum: ["UNIT", "SQFT"],
      default: "UNIT",
    },

    pricingRate: {
      type: Number,
      default: 0,
      min: 0,
    },

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

    deleted_at: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

subCategorySchema.index(
  { category_id: 1, name: 1, businessLevel: 1 },
  { unique: true }
);

// Hot-path indexes for public listing APIs.
subCategorySchema.index({ status: 1, deleted_at: 1, name: 1 });
subCategorySchema.index({ status: 1, deleted_at: 1, category_id: 1, name: 1 });

module.exports = mongoose.model("SubCategory", subCategorySchema);

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    businessLevel: {
      type: String,
      enum: ["INDIVIDUAL", "SMALL_TEAM", "ENTERPRISE"],
      required: true,
      default: "INDIVIDUAL",
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      immutable: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
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

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
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
  { timestamps: true }
);

categorySchema.index(
  { name: 1, businessLevel: 1 },
  { unique: true }
);

// Hot-path index for public categories listing.
categorySchema.index({ status: 1, deleted_at: 1, name: 1 });

module.exports = mongoose.model("Category", categorySchema);

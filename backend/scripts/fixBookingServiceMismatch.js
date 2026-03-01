const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Booking = require("../models/Booking");
const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

async function run() {
  await connectDB();

  const bookings = await Booking.find({
    packageCode: { $exists: true, $nin: ["", null] },
    status: { $ne: "CANCELLED" },
  }).select("_id packageCode subCategoryId categoryId");

  let fixed = 0;
  let skipped = 0;

  for (const booking of bookings) {
    const packageCode = String(booking.packageCode || "").trim();
    if (!packageCode) {
      skipped += 1;
      continue;
    }

    let matchedSubCategory = null;
    if (mongoose.Types.ObjectId.isValid(packageCode)) {
      matchedSubCategory = await SubCategory.findById(packageCode).select(
        "_id category_id"
      );
    } else {
      matchedSubCategory = await SubCategory.findOne({ slug: packageCode }).select(
        "_id category_id"
      );
    }

    if (!matchedSubCategory) {
      skipped += 1;
      continue;
    }

    const currentSub = String(booking.subCategoryId || "");
    const targetSub = String(matchedSubCategory._id);
    const targetCategory = String(matchedSubCategory.category_id);
    const currentCategory = String(booking.categoryId || "");

    if (currentSub === targetSub && currentCategory === targetCategory) {
      skipped += 1;
      continue;
    }

    const categoryExists = await Category.findById(matchedSubCategory.category_id).select(
      "_id"
    );
    if (!categoryExists) {
      skipped += 1;
      continue;
    }

    await Booking.updateOne(
      { _id: booking._id },
      {
        $set: {
          subCategoryId: matchedSubCategory._id,
          categoryId: matchedSubCategory.category_id,
        },
        $push: {
          statusHistory: {
            status: booking.status || "BOOKED",
            note: "Service/category auto-corrected from packageCode mapping",
            at: new Date(),
          },
        },
      }
    );
    fixed += 1;
  }

  console.log(`Booking mismatch fix complete. Fixed: ${fixed}, Skipped: ${skipped}`);
  await mongoose.connection.close();
}

run().catch(async (error) => {
  console.error("Failed to fix booking mismatch:", error);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

const isDryRun = process.argv.includes("--dry-run");

function toText(...values) {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferPricingModel(text) {
  if (/(paint|painting|tile|tiling|waterproof|wall|floor)/i.test(text)) {
    return "AREA_BASED";
  }
  if (/(ac|air[\s-]?condition|aircon|split|window)/i.test(text)) {
    return "QUANTITY_BASED";
  }
  return "STANDARD";
}

function inferUnitType(model) {
  return model === "AREA_BASED" ? "SQFT" : "UNIT";
}

function inferRate({ existingRate, model, basePrice }) {
  const rate = Number(existingRate);
  if (Number.isFinite(rate) && rate > 0) return rate;

  const bp = Number(basePrice);

  if (model === "AREA_BASED") {
    if (Number.isFinite(bp) && bp > 0 && bp <= 200) return bp;
    return 20;
  }

  if (model === "QUANTITY_BASED") {
    if (Number.isFinite(bp) && bp > 0) return bp;
    return 499;
  }

  if (Number.isFinite(bp) && bp > 0) return bp;
  return 0;
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB (${isDryRun ? "DRY RUN" : "WRITE"})`);

  const categoryRows = await Category.find({
    $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
  })
    .select("_id name slug pricingModel pricingUnitType pricingRate")
    .lean();

  const subCategoryRows = await SubCategory.find({
    $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
  })
    .select(
      "_id name slug category_id basePrice pricingModel pricingUnitType pricingRate"
    )
    .lean();

  const subByCategory = new Map();
  for (const sub of subCategoryRows) {
    const key = String(sub.category_id);
    if (!subByCategory.has(key)) subByCategory.set(key, []);
    subByCategory.get(key).push(sub);
  }

  const subOps = [];
  let subWillChange = 0;
  for (const sub of subCategoryRows) {
    const text = toText(sub.name, sub.slug);
    const model =
      ["STANDARD", "QUANTITY_BASED", "AREA_BASED"].includes(sub.pricingModel)
        ? sub.pricingModel
        : inferPricingModel(text);
    const unitType =
      sub.pricingUnitType === "SQFT" || sub.pricingUnitType === "UNIT"
        ? sub.pricingUnitType
        : inferUnitType(model);
    const rate = inferRate({
      existingRate: sub.pricingRate,
      model,
      basePrice: sub.basePrice,
    });

    const changed =
      model !== sub.pricingModel ||
      unitType !== sub.pricingUnitType ||
      Number(rate || 0) !== Number(sub.pricingRate || 0);
    if (!changed) continue;

    subWillChange += 1;
    subOps.push({
      updateOne: {
        filter: { _id: sub._id },
        update: {
          $set: {
            pricingModel: model,
            pricingUnitType: unitType,
            pricingRate: rate,
          },
        },
      },
    });
  }

  const catOps = [];
  let catWillChange = 0;
  for (const cat of categoryRows) {
    const catSubs = subByCategory.get(String(cat._id)) || [];
    const text = toText(cat.name, cat.slug);

    const existingModelValid = ["STANDARD", "QUANTITY_BASED", "AREA_BASED"].includes(
      cat.pricingModel
    );
    let model = existingModelValid ? cat.pricingModel : inferPricingModel(text);

    if (!existingModelValid && catSubs.length) {
      const counts = catSubs.reduce(
        (acc, sub) => {
          const m = ["STANDARD", "QUANTITY_BASED", "AREA_BASED"].includes(sub.pricingModel)
            ? sub.pricingModel
            : inferPricingModel(toText(sub.name, sub.slug));
          acc[m] = (acc[m] || 0) + 1;
          return acc;
        },
        {}
      );
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (dominant) model = dominant;
    }

    const unitType =
      cat.pricingUnitType === "SQFT" || cat.pricingUnitType === "UNIT"
        ? cat.pricingUnitType
        : inferUnitType(model);

    const existingRate = Number(cat.pricingRate);
    let rate = Number.isFinite(existingRate) && existingRate > 0 ? existingRate : 0;
    if (rate <= 0) {
      const subRates = catSubs
        .map((sub) => Number(sub.pricingRate || 0))
        .filter((value) => Number.isFinite(value) && value > 0);
      if (subRates.length) {
        rate = Math.round(subRates.reduce((a, b) => a + b, 0) / subRates.length);
      } else {
        rate = inferRate({ existingRate: 0, model, basePrice: 0 });
      }
    }

    const changed =
      model !== cat.pricingModel ||
      unitType !== cat.pricingUnitType ||
      Number(rate || 0) !== Number(cat.pricingRate || 0);
    if (!changed) continue;

    catWillChange += 1;
    catOps.push({
      updateOne: {
        filter: { _id: cat._id },
        update: {
          $set: {
            pricingModel: model,
            pricingUnitType: unitType,
            pricingRate: rate,
          },
        },
      },
    });
  }

  console.log(`Sub-categories to update: ${subWillChange}`);
  console.log(`Categories to update: ${catWillChange}`);

  if (!isDryRun) {
    if (subOps.length) await SubCategory.bulkWrite(subOps, { ordered: false });
    if (catOps.length) await Category.bulkWrite(catOps, { ordered: false });
    console.log("Migration applied successfully.");
  } else {
    console.log("Dry run complete. No writes performed.");
  }

  await mongoose.disconnect();
}

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Pricing migration failed:", error);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  });

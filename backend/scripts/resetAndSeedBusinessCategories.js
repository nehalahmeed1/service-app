const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Admin = require("../models/Admin");
const slugify = require("slugify");

const SEED_DATA = [
  {
    businessLevel: "INDIVIDUAL",
    categories: [
      {
        name: "Home Cleaning",
        subCategories: [
          "Bathroom Cleaning",
          "Kitchen Cleaning",
          "Full Home Cleaning",
        ],
      },
      {
        name: "Plumbing Services",
        subCategories: ["Leak Repair", "Tap Fitting", "Toilet Repair"],
      },
      {
        name: "Electrical Services",
        subCategories: ["Fan Installation", "Switch Repair", "Wiring Repair"],
      },
      {
        name: "Beauty and Wellness",
        subCategories: [
          "Women Salon at Home",
          "Men Grooming",
          "Home Massage Therapy",
        ],
      },
    ],
  },
  {
    businessLevel: "SMALL_TEAM",
    categories: [
      {
        name: "Office Maintenance",
        subCategories: [
          "Office Cleaning",
          "Restroom Sanitization",
          "Pantry Upkeep",
        ],
      },
      {
        name: "Facility Repair",
        subCategories: [
          "Electrical AMC",
          "Plumbing AMC",
          "Carpentry and Fixtures",
        ],
      },
      {
        name: "IT and Networking",
        subCategories: ["CCTV Setup", "LAN Cabling", "Router and WiFi Setup"],
      },
    ],
  },
  {
    businessLevel: "ENTERPRISE",
    categories: [
      {
        name: "Integrated Facility Management",
        subCategories: [
          "Soft Services",
          "Hard Services",
          "Helpdesk Operations",
        ],
      },
      {
        name: "Industrial Technical Services",
        subCategories: [
          "Electrical Systems",
          "Mechanical Maintenance",
          "Safety Compliance",
        ],
      },
      {
        name: "Corporate Housekeeping and Wellness",
        subCategories: [
          "Corporate Housekeeping",
          "Employee Wellness Programs",
          "Campus Pest Management",
        ],
      },
    ],
  },
];

async function generateUniqueCategorySlug(name) {
  const base = slugify(name, { lower: true, strict: true, trim: true });
  let slug = base;
  let i = 1;
  while (await Category.findOne({ slug })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

async function generateUniqueSubCategorySlug(name, categoryId) {
  const base = slugify(name, { lower: true, strict: true, trim: true });
  let slug = base;
  let i = 1;
  while (await SubCategory.findOne({ slug, category_id: categoryId })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected:", process.env.MONGO_URI);

  const admin = await Admin.findOne({}).sort({ createdAt: 1 });
  if (!admin) {
    throw new Error("No admin found. Create at least one admin first.");
  }

  const adminId = admin._id;

  const deletedSubs = await SubCategory.deleteMany({});
  const deletedCats = await Category.deleteMany({});
  console.log(
    `Deleted existing records => categories: ${deletedCats.deletedCount}, sub-categories: ${deletedSubs.deletedCount}`
  );

  let createdCategories = 0;
  let createdSubCategories = 0;

  for (const levelGroup of SEED_DATA) {
    for (const categorySeed of levelGroup.categories) {
      const categorySlug = await generateUniqueCategorySlug(categorySeed.name);

      const category = await Category.create({
        name: categorySeed.name,
        slug: categorySlug,
        businessLevel: levelGroup.businessLevel,
        status: "active",
        createdBy: adminId,
        updatedBy: adminId,
        deleted_at: null,
      });
      createdCategories++;

      for (const subName of categorySeed.subCategories) {
        const subSlug = await generateUniqueSubCategorySlug(subName, category._id);
        await SubCategory.create({
          name: subName,
          slug: subSlug,
          category_id: category._id,
          businessLevel: levelGroup.businessLevel,
          status: "active",
          createdBy: adminId,
          updatedBy: adminId,
          deleted_at: null,
        });
        createdSubCategories++;
      }
    }
  }

  console.log(
    `Seed completed => categories: ${createdCategories}, sub-categories: ${createdSubCategories}`
  );
  await mongoose.disconnect();
}

run()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seed failed:", err.message);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  });

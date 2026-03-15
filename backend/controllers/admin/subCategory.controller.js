const SubCategory = require("../../models/SubCategory");
const Category = require("../../models/Category");
const slugify = require("slugify");
const XLSX = require("xlsx");

const notDeletedQuery = {
  $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
};

const PRICING_MODE_SET = new Set(["STANDARD", "QUANTITY_BASED", "AREA_BASED"]);
const PRICING_UNIT_SET = new Set(["UNIT", "SQFT"]);

function parsePricingInput(body = {}) {
  const pricingModel = String(body.pricingModel || "STANDARD")
    .trim()
    .toUpperCase();
  const pricingUnitType = String(body.pricingUnitType || "UNIT")
    .trim()
    .toUpperCase();
  const parsedRate = Number(body.pricingRate ?? 0);

  if (!PRICING_MODE_SET.has(pricingModel)) {
    return { error: "Invalid pricing model" };
  }
  if (!PRICING_UNIT_SET.has(pricingUnitType)) {
    return { error: "Invalid pricing unit type" };
  }
  if (!Number.isFinite(parsedRate) || parsedRate < 0) {
    return { error: "Pricing rate must be a non-negative number" };
  }

  return {
    pricingModel,
    pricingUnitType,
    pricingRate: parsedRate,
  };
}

const resolveBusinessLevel = async (categoryId) => {
  const category = await Category.findOne({
    _id: categoryId,
    ...notDeletedQuery,
  }).select("businessLevel");

  return category?.businessLevel || "INDIVIDUAL";
};

const generateUniqueSlug = async (name, categoryId) => {
  const baseSlug = slugify(name, { lower: true, strict: true, trim: true });
  let slug = baseSlug;
  let counter = 1;

  while (
    await SubCategory.findOne({
      slug,
      category_id: categoryId,
      ...notDeletedQuery,
    })
  ) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};

exports.getSubCategories = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const { search = "", status, businessLevel } = req.query;
    const query = { ...notDeletedQuery };

    if (search) {
      query.$and = [
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    if (status && status !== "all") query.status = status;
    if (businessLevel && businessLevel !== "all") {
      query.businessLevel = businessLevel;
    }

    const [data, total] = await Promise.all([
      SubCategory.find(query)
        .populate("category_id", "name businessLevel")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SubCategory.countDocuments(query),
    ]);

    res.json({
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Get sub-categories error:", err);
    res.status(500).json({ message: "Failed to fetch sub-categories" });
  }
};

exports.getSubCategoryById = async (req, res) => {
  const subCategory = await SubCategory.findOne({
    _id: req.params.id,
    ...notDeletedQuery,
  }).populate("category_id", "name businessLevel");

  if (!subCategory) {
    return res.status(404).json({ message: "Sub-category not found" });
  }

  res.json({ data: subCategory });
};

exports.createSubCategory = async (req, res) => {
  const { name, category_id, basePrice } = req.body;
  const pricing = parsePricingInput(req.body);

  if (!name || !category_id) {
    return res.status(400).json({ message: "Name and category required" });
  }
  if (pricing.error) {
    return res.status(400).json({ message: pricing.error });
  }

  const parsedBasePrice = Number(basePrice ?? 0);
  if (!Number.isFinite(parsedBasePrice) || parsedBasePrice < 0) {
    return res.status(400).json({ message: "Base price must be a valid non-negative number" });
  }

  const category = await Category.findOne({
    _id: category_id,
    ...notDeletedQuery,
  });

  if (!category) {
    return res.status(404).json({ message: "Parent category not found" });
  }

  const slug = await generateUniqueSlug(name, category_id);

  const subCategory = await SubCategory.create({
    name,
    slug,
    category_id,
    businessLevel: category.businessLevel,
    status: "active",
    basePrice: parsedBasePrice,
    pricingModel: pricing.pricingModel,
    pricingUnitType: pricing.pricingUnitType,
    pricingRate: pricing.pricingRate,
    createdBy: req.admin._id,
    deleted_at: null,
  });

  res.status(201).json({ data: subCategory });
};

exports.updateSubCategory = async (req, res) => {
  const subCategory = await SubCategory.findOne({
    _id: req.params.id,
    ...notDeletedQuery,
  });

  if (!subCategory) {
    return res.status(404).json({ message: "Sub-category not found" });
  }

  const { name, status, category_id, basePrice } = req.body;
  if (name) subCategory.name = name;
  if (status) subCategory.status = status;
  if (basePrice !== undefined) {
    const parsedBasePrice = Number(basePrice);
    if (!Number.isFinite(parsedBasePrice) || parsedBasePrice < 0) {
      return res.status(400).json({ message: "Base price must be a valid non-negative number" });
    }
    subCategory.basePrice = parsedBasePrice;
  }
  if (
    req.body.pricingModel !== undefined ||
    req.body.pricingUnitType !== undefined ||
    req.body.pricingRate !== undefined
  ) {
    const pricing = parsePricingInput({
      pricingModel: req.body.pricingModel ?? subCategory.pricingModel,
      pricingUnitType: req.body.pricingUnitType ?? subCategory.pricingUnitType,
      pricingRate: req.body.pricingRate ?? subCategory.pricingRate,
    });
    if (pricing.error) {
      return res.status(400).json({ message: pricing.error });
    }
    subCategory.pricingModel = pricing.pricingModel;
    subCategory.pricingUnitType = pricing.pricingUnitType;
    subCategory.pricingRate = pricing.pricingRate;
  }

  if (category_id && String(subCategory.category_id) !== String(category_id)) {
    const category = await Category.findOne({
      _id: category_id,
      ...notDeletedQuery,
    });

    if (!category) {
      return res.status(404).json({ message: "Parent category not found" });
    }

    subCategory.category_id = category_id;
    subCategory.businessLevel = category.businessLevel;
  }

  if (!subCategory.businessLevel) {
    subCategory.businessLevel = await resolveBusinessLevel(subCategory.category_id);
  }

  subCategory.updatedBy = req.admin._id;
  await subCategory.save();

  res.json({ data: subCategory });
};

exports.toggleSubCategoryStatus = async (req, res) => {
  try {
    const subCategory = await SubCategory.findOne({
      _id: req.params.id,
      ...notDeletedQuery,
    });

    if (!subCategory) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    subCategory.status = subCategory.status === "active" ? "inactive" : "active";
    if (!subCategory.businessLevel) {
      subCategory.businessLevel = await resolveBusinessLevel(subCategory.category_id);
    }
    subCategory.updatedBy = req.admin._id;
    await subCategory.save();

    res.json({
      message: "Sub-category status updated successfully",
      status: subCategory.status,
    });
  } catch (err) {
    console.error("Toggle sub-category status error:", err);
    res.status(500).json({ message: "Failed to toggle status" });
  }
};

exports.deleteSubCategory = async (req, res) => {
  const subCategory = await SubCategory.findOne({
    _id: req.params.id,
    ...notDeletedQuery,
  });

  if (!subCategory) {
    return res.status(404).json({ message: "Sub-category not found" });
  }

  subCategory.deleted_at = new Date();
  if (!subCategory.businessLevel) {
    subCategory.businessLevel = await resolveBusinessLevel(subCategory.category_id);
  }
  subCategory.updatedBy = req.admin._id;

  await subCategory.save();

  res.json({ success: true });
};

exports.bulkUploadSubCategories = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Excel file required" });
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.category || !row.sub_category) {
      skipped++;
      continue;
    }

    const parent = await Category.findOne({
      name: row.category,
      status: "active",
      ...notDeletedQuery,
    });

    if (!parent) {
      skipped++;
      continue;
    }

    const exists = await SubCategory.findOne({
      name: row.sub_category,
      category_id: parent._id,
      ...notDeletedQuery,
    });

    if (exists) {
      skipped++;
      continue;
    }

    const slug = await generateUniqueSlug(row.sub_category, parent._id);

    await SubCategory.create({
      name: row.sub_category,
      slug,
      category_id: parent._id,
      businessLevel: parent.businessLevel,
      status: "active",
      basePrice: Number(row.base_price ?? row.price ?? 0) || 0,
      pricingModel: "STANDARD",
      pricingUnitType: "UNIT",
      pricingRate: 0,
      createdBy: req.admin._id,
      deleted_at: null,
    });

    created++;
  }

  res.json({ success: true, created, skipped });
};

exports.bulkUpdateSubCategoryPricing = async (req, res) => {
  try {
    const updates = Array.isArray(req.body?.updates) ? req.body.updates : [];

    if (!updates.length) {
      return res.status(400).json({ message: "At least one pricing update is required" });
    }
    if (updates.length > 500) {
      return res.status(400).json({ message: "Maximum 500 records can be updated at once" });
    }

    const operations = [];
    for (const item of updates) {
      const id = String(item?.id || "").trim();
      if (!id) continue;

      const pricing = parsePricingInput(item);
      if (pricing.error) {
        return res.status(400).json({ message: `${pricing.error} for id ${id}` });
      }

      const set = {
        pricingModel: pricing.pricingModel,
        pricingUnitType: pricing.pricingUnitType,
        pricingRate: pricing.pricingRate,
        updatedBy: req.admin?._id,
      };

      if (item.basePrice !== undefined) {
        const parsedBasePrice = Number(item.basePrice);
        if (!Number.isFinite(parsedBasePrice) || parsedBasePrice < 0) {
          return res.status(400).json({ message: `Invalid basePrice for id ${id}` });
        }
        set.basePrice = parsedBasePrice;
      }

      operations.push({
        updateOne: {
          filter: { _id: id, ...notDeletedQuery },
          update: { $set: set },
        },
      });
    }

    if (!operations.length) {
      return res.status(400).json({ message: "No valid update records found" });
    }

    const result = await SubCategory.bulkWrite(operations, { ordered: false });

    return res.json({
      success: true,
      data: {
        matchedCount: result.matchedCount || 0,
        modifiedCount: result.modifiedCount || 0,
      },
    });
  } catch (error) {
    console.error("Bulk update sub-category pricing error:", error);
    return res.status(500).json({ message: "Failed to bulk update pricing" });
  }
};

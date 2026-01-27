const SubCategory = require("../../models/SubCategory");
const Category = require("../../models/Category");
const slugify = require("slugify");
const XLSX = require("xlsx");

const notDeletedQuery = {
  $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
};

/* ================= UTIL ================= */

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

/* ================= LIST ================= */

exports.getSubCategories = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const { search = "", status } = req.query;

    const query = { ...notDeletedQuery };

    if (search) {
      query.$or = [
        ...(query.$or || []),
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") query.status = status;

    const [data, total] = await Promise.all([
      SubCategory.find(query)
        .populate("category_id", "name")
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
    res.status(500).json({ message: "Failed to fetch sub-categories" });
  }
};

/* ================= GET BY ID ================= */

exports.getSubCategoryById = async (req, res) => {
  const subCategory = await SubCategory.findOne({
    _id: req.params.id,
    ...notDeletedQuery,
  }).populate("category_id", "name");

  if (!subCategory)
    return res.status(404).json({ message: "Sub-category not found" });

  res.json({ data: subCategory });
};

/* ================= CREATE ================= */

exports.createSubCategory = async (req, res) => {
  const { name, category_id } = req.body;

  if (!name || !category_id)
    return res.status(400).json({ message: "Name & category required" });

  const slug = await generateUniqueSlug(name, category_id);

  const subCategory = await SubCategory.create({
    name,
    slug,
    category_id,
    status: "active",
    createdBy: req.admin._id,
    deleted_at: null,
  });

  res.status(201).json({ data: subCategory });
};

/* ================= UPDATE ================= */

exports.updateSubCategory = async (req, res) => {
  const subCategory = await SubCategory.findOne({
    _id: req.params.id,
    ...notDeletedQuery,
  });

  if (!subCategory)
    return res.status(404).json({ message: "Sub-category not found" });

  const { name, status } = req.body;
  if (name) subCategory.name = name;
  if (status) subCategory.status = status;

  subCategory.updatedBy = req.admin._id;
  await subCategory.save();

  res.json({ data: subCategory });
};

/* ================= DELETE (SOFT) ================= */

exports.deleteSubCategory = async (req, res) => {
  const subCategory = await SubCategory.findOne({
    _id: req.params.id,
    ...notDeletedQuery,
  });

  if (!subCategory)
    return res.status(404).json({ message: "Sub-category not found" });

  subCategory.deleted_at = new Date();
  subCategory.updatedBy = req.admin._id;

  await subCategory.save();

  res.json({ success: true });
};

/* ================= BULK UPLOAD ================= */

exports.bulkUploadSubCategories = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "Excel file required" });

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  let created = 0,
    skipped = 0;

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
      status: "active",
      createdBy: req.admin._id,
      deleted_at: null,
    });

    created++;
  }

  res.json({ success: true, created, skipped });
};

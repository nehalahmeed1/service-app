const Category = require("../../models/Category");
const slugify = require("slugify");

const notDeletedQuery = {
  $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
};

/**
 * Generate UNIQUE slug
 */
const generateUniqueSlug = async (name) => {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (await Category.findOne({ slug })) {
    slug = `${baseSlug}_${counter}`;
    counter++;
  }

  return slug;
};

/**
 * GET ALL CATEGORIES (PAGINATED)
 */
exports.getCategories = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
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

    if (status && status !== "all") {
      query.status = status;
    }

    const [data, total] = await Promise.all([
      Category.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email"),
      Category.countDocuments(query),
    ]);

    res.json({
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Pagination error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

/**
 * GET CATEGORY BY ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      ...notDeletedQuery,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Get category by id error:", error);
    res.status(500).json({ message: "Failed to fetch category" });
  }
};

/**
 * CREATE CATEGORY
 */
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const nameExists = await Category.findOne({
      name,
      ...notDeletedQuery,
    });

    if (nameExists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const slug = await generateUniqueSlug(name);

    const category = await Category.create({
      name,
      slug,
      status: "active",
      createdBy: req.admin._id,
      deleted_at: null, // ✅ explicit
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

/**
 * UPDATE CATEGORY
 */
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      ...notDeletedQuery,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (req.body.name) category.name = req.body.name;
    if (req.body.status) category.status = req.body.status;

    category.updatedBy = req.admin._id;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

/**
 * SOFT DELETE CATEGORY
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      ...notDeletedQuery,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.deleted_at = new Date();
    category.updatedBy = req.admin._id;

    await category.save();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

/**
 * TOGGLE CATEGORY STATUS
 */
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      ...notDeletedQuery,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.status =
      category.status === "active" ? "inactive" : "active";

    category.updatedBy = req.admin._id;

    await category.save();

    res.json({
      message: "Category status updated successfully",
      status: category.status,
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

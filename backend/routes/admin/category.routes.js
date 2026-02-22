const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../../middleware/adminAuthMiddleware");

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} = require("../../controllers/admin/category.controller");

/**
 * BASE PATH:
 * /api/admin/categories
 */

router.post("/", adminAuthMiddleware, createCategory);
router.get("/", adminAuthMiddleware, getCategories);
router.get("/:id", adminAuthMiddleware, getCategoryById);
router.put("/:id", adminAuthMiddleware, updateCategory);
router.delete("/:id", adminAuthMiddleware, deleteCategory);
router.patch("/:id/status", adminAuthMiddleware, toggleCategoryStatus);

module.exports = router;

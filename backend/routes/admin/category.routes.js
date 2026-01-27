const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");

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

router.post("/", authMiddleware, createCategory);
router.get("/", authMiddleware, getCategories);
router.get("/:id", authMiddleware, getCategoryById);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);
router.patch("/:id/status", authMiddleware, toggleCategoryStatus);

module.exports = router;

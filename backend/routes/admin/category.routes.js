const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} = require("../../controllers/admin/category.controller"); // ✅ FIXED

const authMiddleware = require("../../middleware/authMiddleware");

/* ================= CATEGORY ROUTES ================= */

router.post("/categories", authMiddleware, createCategory);
router.get("/categories", authMiddleware, getCategories);
router.get("/categories/:id", authMiddleware, getCategoryById);
router.put("/categories/:id", authMiddleware, updateCategory);
router.delete("/categories/:id", authMiddleware, deleteCategory);
router.patch("/categories/:id/status", authMiddleware, toggleCategoryStatus);

module.exports = router;

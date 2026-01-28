const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");

const {
  getSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  bulkUploadSubCategories,
  toggleSubCategoryStatus, // ✅ ADD
} = require("../../controllers/admin/subCategory.controller");

/**
 * BASE PATH:
 * /api/admin/sub-categories
 */

router.get("/", authMiddleware, getSubCategories);
router.get("/:id", authMiddleware, getSubCategoryById);
router.post("/", authMiddleware, createSubCategory);
router.put("/:id", authMiddleware, updateSubCategory);

// ✅ TOGGLE STATUS (ON / OFF)
router.patch(
  "/:id/toggle-status",
  authMiddleware,
  toggleSubCategoryStatus
);

router.delete("/:id", authMiddleware, deleteSubCategory);
router.post("/bulk-upload", authMiddleware, bulkUploadSubCategories);

module.exports = router;

const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../../middleware/adminAuthMiddleware");

const {
  getSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  bulkUploadSubCategories,
  toggleSubCategoryStatus,
} = require("../../controllers/admin/subCategory.controller");

/**
 * BASE PATH:
 * /api/admin/sub-categories
 */

router.get("/", adminAuthMiddleware, getSubCategories);
router.get("/:id", adminAuthMiddleware, getSubCategoryById);
router.post("/", adminAuthMiddleware, createSubCategory);
router.put("/:id", adminAuthMiddleware, updateSubCategory);

// ✅ TOGGLE STATUS (ON / OFF)
router.patch(
  "/:id/toggle-status",
  adminAuthMiddleware,
  toggleSubCategoryStatus
);

router.delete("/:id", adminAuthMiddleware, deleteSubCategory);
router.post("/bulk-upload", adminAuthMiddleware, bulkUploadSubCategories);

module.exports = router;

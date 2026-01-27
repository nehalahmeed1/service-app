import api from "./api";

/* ======================================================
   SUB-CATEGORIES
====================================================== */

/**
 * Fetch sub-categories (with pagination, search, status)
 * @param {Object} params
 */
export const fetchSubCategories = async (params = {}) => {
  const res = await api.get("/admin/sub-categories", { params });
  return res.data;
};

/**
 * Create new sub-category
 * @param {Object} data
 */
export const createSubCategory = async (data) => {
  const res = await api.post("/admin/sub-categories", data);
  return res.data;
};

/**
 * Update sub-category
 * @param {String} id
 * @param {Object} data
 */
export const updateSubCategory = async (id, data) => {
  const res = await api.put(`/admin/sub-categories/${id}`, data);
  return res.data;
};

/**
 * Toggle sub-category status (active / inactive)
 * @param {String} id
 */
export const toggleSubCategoryStatus = async (id) => {
  const res = await api.patch(
    `/admin/sub-categories/${id}/toggle-status`
  );
  return res.data;
};

/**
 * Fetch single sub-category by ID (for edit)
 * @param {String} id
 */
export const fetchSubCategoryById = async (id) => {
  const res = await api.get(`/admin/sub-categories/${id}`);
  return res.data;
};

/* ======================================================
   CATEGORIES (for dropdown)
====================================================== */

/**
 * Fetch categories (used in sub-category dropdown)
 * @param {Object} params
 */
export const fetchCategories = async (params = {}) => {
  const res = await api.get("/admin/categories", { params });
  return res.data;
};

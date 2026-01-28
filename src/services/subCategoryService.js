import api from "@/utils/api";

/* =====================================================
   SUB-CATEGORIES
===================================================== */

/**
 * Fetch sub-categories (list)
 * Supports: search, status, page, limit
 */
export const fetchSubCategories = async (params = {}) => {
  const res = await api.get("/admin/sub-categories", { params });
  return res.data;
};

/**
 * Fetch single sub-category (edit page)
 */
export const fetchSubCategoryById = async (id) => {
  const res = await api.get(`/admin/sub-categories/${id}`);
  return res.data;
};

/**
 * Create sub-category
 */
export const createSubCategory = async (data) => {
  const res = await api.post("/admin/sub-categories", data);
  return res.data;
};

/**
 * Update sub-category
 */
export const updateSubCategory = async (id, data) => {
  const res = await api.put(`/admin/sub-categories/${id}`, data);
  return res.data;
};

/**
 * Toggle sub-category status (ACTIVE / INACTIVE)
 */
export const toggleSubCategoryStatus = async (id) => {
  const res = await api.patch(
    `/admin/sub-categories/${id}/toggle-status`
  );
  return res.data;
};

/**
 * Delete sub-category (soft delete)
 */
export const deleteSubCategory = async (id) => {
  const res = await api.delete(`/admin/sub-categories/${id}`);
  return res.data;
};

/**
 * Bulk upload sub-categories (Excel)
 */
export const bulkUploadSubCategories = async (formData) => {
  const res = await api.post(
    "/admin/sub-categories/bulk-upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

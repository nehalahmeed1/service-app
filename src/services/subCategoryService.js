import api from "./api";

/* =====================================================
   FETCH SUB-CATEGORIES (LIST)
   Supports: search, status, page, limit
===================================================== */
export const fetchSubCategories = async (params) => {
  const res = await api.get("/admin/sub-categories", { params });
  return res.data;
};

/* =====================================================
   FETCH SINGLE SUB-CATEGORY (EDIT PAGE)
===================================================== */
export const fetchSubCategoryById = async (id) => {
  const res = await api.get(`/admin/sub-categories/${id}`);
  return res.data;
};

/* =====================================================
   CREATE SUB-CATEGORY
===================================================== */
export const createSubCategory = async (data) => {
  const res = await api.post("/admin/sub-categories", data);
  return res.data;
};

/* =====================================================
   UPDATE SUB-CATEGORY (NAME ONLY)
===================================================== */
export const updateSubCategory = async (id, data) => {
  const res = await api.put(`/admin/sub-categories/${id}`, data);
  return res.data;
};

/* =====================================================
   TOGGLE STATUS (ACTIVE / INACTIVE)
===================================================== */
export const toggleSubCategoryStatus = async (id) => {
  const res = await api.patch(`/admin/sub-categories/${id}/status`);
  return res.data;
};

/* =====================================================
   DELETE SUB-CATEGORY (SOFT DELETE)
===================================================== */
export const deleteSubCategory = async (id) => {
  const res = await api.delete(`/admin/sub-categories/${id}`);
  return res.data;
};

/* =====================================================
   BULK UPLOAD SUB-CATEGORIES (EXCEL)
   Endpoint: POST /api/admin/sub-categories/bulk-upload
===================================================== */
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

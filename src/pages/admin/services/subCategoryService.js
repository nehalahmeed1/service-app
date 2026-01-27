import api from "./api";

/* ================= FETCH LIST ================= */
export const fetchSubCategories = async (params) => {
  const res = await api.get("/admin/sub-categories", { params });
  return res.data;
};

/* ================= FETCH SINGLE ================= */
export const fetchSubCategoryById = async (id) => {
  const res = await api.get(`/admin/sub-categories/${id}`);
  return res.data;
};

/* ================= CREATE ================= */
export const createSubCategory = async (data) => {
  const res = await api.post("/admin/sub-categories", data);
  return res.data;
};

/* ================= UPDATE ================= */
export const updateSubCategory = async (id, data) => {
  const res = await api.put(`/admin/sub-categories/${id}`, data);
  return res.data;
};

/* ================= STATUS TOGGLE (✅ FIXED URL) ================= */
export const toggleSubCategoryStatus = async (id) => {
  const res = await api.patch(`/admin/sub-categories/${id}/status`);
  return res.data;
};

/* ================= DELETE ================= */
export const deleteSubCategory = async (id) => {
  const res = await api.delete(`/admin/sub-categories/${id}`);
  return res.data;
};

/* ================= BULK UPLOAD (✅ MISSING EXPORT FIXED) ================= */
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

import api from "../../../utils/api";

/* ================= PAGINATED ================= */
export const getCategoriesPaginated = (params) =>
  api.get("/admin/categories", { params });

/* ================= GET ONE ================= */
export const getCategoryById = (id) =>
  api.get(`/admin/categories/${id}`);

/* ================= CREATE ================= */
export const createCategory = (data) =>
  api.post("/admin/categories", data);

/* ================= UPDATE ================= */
export const updateCategory = (id, data) =>
  api.put(`/admin/categories/${id}`, data);

/* ================= DELETE ================= */
export const deleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`);

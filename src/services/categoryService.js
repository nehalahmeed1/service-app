import api from "./providerApi";

/* ======================================================
   PUBLIC – PROVIDER / CUSTOMER
====================================================== */

/**
 * Fetch ACTIVE categories (provider onboarding, filters)
 * GET /api/categories
 */
export const fetchPublicCategories = async () => {
  const res = await api.get("/categories");
  return res.data.data || []; // ✅ always array
};

/* ======================================================
   ADMIN – CATEGORY MANAGEMENT
====================================================== */

export const fetchCategories = async (params = {}) => {
  const res = await api.get("/admin/categories", { params });
  return res.data;
};

export const createCategory = async (data) => {
  const res = await api.post("/admin/categories", data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await api.put(`/admin/categories/${id}`, data);
  return res.data;
};

export const fetchCategoryById = async (id) => {
  const res = await api.get(`/admin/categories/${id}`);
  return res.data;
};

export const toggleCategoryStatus = async (id, status) => {
  const res = await api.put(`/admin/categories/${id}`, { status });
  return res.data;
};

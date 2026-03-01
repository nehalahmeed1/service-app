import adminApi from "@/services/adminApi";

export const fetchProvidersInsights = async (params = {}) => {
  const res = await adminApi.get("/admin/insights/providers", { params });
  return res.data?.data || { summary: {}, rows: [] };
};

export const fetchCustomersInsights = async (params = {}) => {
  const res = await adminApi.get("/admin/insights/customers", { params });
  return res.data?.data || { summary: {}, rows: [] };
};

export const fetchReportsInsights = async (params = {}) => {
  const res = await adminApi.get("/admin/insights/reports", { params });
  return res.data?.data || {};
};

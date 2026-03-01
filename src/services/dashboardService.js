import adminApi from "./adminApi";

export const fetchDashboardStats = (params = {}) => {
  return adminApi.get("/admin/dashboard", { params });
};

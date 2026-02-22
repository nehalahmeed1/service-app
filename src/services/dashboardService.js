import adminApi from "./adminApi";

export const fetchDashboardStats = () => {
  return adminApi.get("/admin/dashboard");
};

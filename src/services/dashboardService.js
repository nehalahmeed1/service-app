import api from "./api";

export const fetchDashboardStats = () => {
  return api.get("/admin/dashboard");
};

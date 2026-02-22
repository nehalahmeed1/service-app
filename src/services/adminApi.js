import axios from "axios";
import { auth } from "@/firebase";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

adminApi.interceptors.request.use(async (config) => {
  const storedAdminToken = localStorage.getItem("admin_token");

  if (storedAdminToken) {
    config.headers.Authorization = `Bearer ${storedAdminToken}`;
    return config;
  }

  const user = auth.currentUser;
  if (user) {
    const firebaseToken = await user.getIdToken();
    config.headers.Authorization = `Bearer ${firebaseToken}`;
  }

  return config;
});

export default adminApi;

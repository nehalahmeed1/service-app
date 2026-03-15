import axios from "axios";
import { auth } from "@/firebase";
import { firebaseAdminLogin } from "@/services/adminAuthService";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

const isUsableToken = (token) =>
  !!token && token !== "undefined" && token !== "null";

adminApi.interceptors.request.use(async (config) => {
  const storedAdminToken = localStorage.getItem("admin_token");

  if (isUsableToken(storedAdminToken)) {
    config.headers.Authorization = `Bearer ${storedAdminToken}`;
    return config;
  }

  if (storedAdminToken && !isUsableToken(storedAdminToken)) {
    localStorage.removeItem("admin_token");
  }

  const user = auth.currentUser;
  if (user) {
    const firebaseToken = await user.getIdToken();
    config.headers.Authorization = `Bearer ${firebaseToken}`;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("No authenticated Firebase user");
        }

        const firebaseToken = await user.getIdToken(true);
        const session = await firebaseAdminLogin(firebaseToken);
        const renewedAdminToken = session?.token;

        if (!isUsableToken(renewedAdminToken)) {
          throw new Error("Admin session token was not returned");
        }

        localStorage.setItem("admin_token", renewedAdminToken);
        if (session?.role) {
          localStorage.setItem("admin_role", session.role);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${renewedAdminToken}`;
        return adminApi(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_role");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ===============================
// REQUEST INTERCEPTOR
// Attach admin token automatically
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// RESPONSE INTERCEPTOR (OPTIONAL)
// Centralized error handling
// ===============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: handle 401 globally
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      // window.location.href = "/admin/login"; // enable if needed
    }
    return Promise.reject(error);
  }
);

export default api;

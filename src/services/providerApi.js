// src/services/providerApi.js
import axios from "axios";

const providerApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

providerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("provider_token"); // 🔴 MUST be provider_token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let axios handle multipart boundaries
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default providerApi;

import axios from "axios";

const supportApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

export async function createSupportRequest(payload) {
  const res = await supportApi.post("/public/support-requests", payload);
  return res.data?.data || null;
}

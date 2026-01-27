import axios from "axios";

// ✅ Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ===============================
 * ADMIN REGISTER
 * ===============================
 * Creates a new admin with status = PENDING
 */
export const registerAdmin = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/admin/auth/register`,
    payload
  );
  return response.data;
};

/**
 * ===============================
 * ADMIN LOGIN
 * ===============================
 * Allows only APPROVED admins to login
 */
export const loginAdmin = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/admin/auth/login`,
    payload
  );
  return response.data;
};

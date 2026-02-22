import axios from "axios";

// Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ===============================
 * ADMIN REGISTER
 * ===============================
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
 * ADMIN LOGIN (EMAIL/PASSWORD)
 * ===============================
 * Used only for manual login (fallback)
 */
export const loginAdmin = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/admin/auth/login`,
    payload
  );

  // store admin token
  if (response.data?.token) {
    localStorage.setItem("admin_token", response.data.token);
  }

  return response.data;
};

/**
 * ===============================
 * FIREBASE ADMIN LOGIN
 * ===============================
 * Used when Firebase auth succeeds
 */
export const firebaseAdminLogin = async (firebaseToken) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/firebase-login`,
    { firebaseToken }
  );

  // store admin token
  if (response.data?.token) {
    localStorage.setItem("admin_token", response.data.token);
  }

  return response.data;
};

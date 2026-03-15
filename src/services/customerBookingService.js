import axios from "axios";
import { auth } from "@/firebase";

const customerBookingApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

customerBookingApi.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Customer not authenticated");
  }

  const firebaseToken = await user.getIdToken();
  config.headers.Authorization = `Bearer ${firebaseToken}`;
  return config;
});

export async function createCustomerBooking(payload) {
  const response = await customerBookingApi.post("/customer/bookings", payload);
  return response.data;
}

export async function fetchCustomerBookings() {
  const response = await customerBookingApi.get("/customer/bookings");
  return response.data?.data || [];
}

export async function cancelCustomerBooking(bookingId, reason) {
  const response = await customerBookingApi.patch(
    `/customer/bookings/${bookingId}/cancel`,
    { reason }
  );
  return response.data?.data;
}

export async function rescheduleCustomerBooking(bookingId, payload) {
  const response = await customerBookingApi.patch(
    `/customer/bookings/${bookingId}/reschedule`,
    payload
  );
  return response.data?.data;
}

export async function raiseCustomerBookingDispute(bookingId, payload) {
  const response = await customerBookingApi.post(
    `/customer/bookings/${bookingId}/dispute`,
    payload
  );
  return response.data?.data;
}

export async function submitCustomerBookingReview(bookingId, payload) {
  const response = await customerBookingApi.post(
    `/customer/bookings/${bookingId}/review`,
    payload
  );
  return response.data?.data;
}

export async function submitCustomerBookingPayment(bookingId, payload) {
  const response = await customerBookingApi.post(
    `/customer/bookings/${bookingId}/payment`,
    payload
  );
  return response.data?.data;
}

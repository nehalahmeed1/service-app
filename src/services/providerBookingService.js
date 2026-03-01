import providerApi from "@/services/providerApi";

export async function fetchIncomingRequests() {
  const response = await providerApi.get("/provider/bookings/requests");
  return response.data?.data || [];
}

export async function fetchProviderJobs() {
  const response = await providerApi.get("/provider/bookings/jobs");
  return response.data?.data || [];
}

export async function fetchProviderBookingStats() {
  const response = await providerApi.get("/provider/bookings/stats");
  return response.data?.data || {};
}

export async function updateProviderBookingStatus(bookingId, status) {
  const response = await providerApi.patch(
    `/provider/bookings/${bookingId}/status`,
    { status }
  );
  return response.data?.data;
}

export async function updateProviderBookingStatusWithNote(bookingId, status, note) {
  const response = await providerApi.patch(
    `/provider/bookings/${bookingId}/status`,
    { status, note }
  );
  return response.data?.data;
}

export async function uploadProviderBookingProof(bookingId, files, note = "") {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  if (note) {
    formData.append("note", note);
  }

  const response = await providerApi.post(
    `/provider/bookings/${bookingId}/proof`,
    formData
  );
  return response.data?.data;
}

export async function cancelProviderBooking(bookingId, reason) {
  const response = await providerApi.patch(
    `/provider/bookings/${bookingId}/cancel`,
    { reason }
  );
  return response.data?.data;
}

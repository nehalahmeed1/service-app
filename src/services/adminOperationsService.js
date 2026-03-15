import adminApi from "@/services/adminApi";

export const fetchServiceRequests = async (params = {}) => {
  const res = await adminApi.get("/admin/operations/service-requests", { params });
  return res.data?.data || { summary: {}, rows: [] };
};

export const fetchPaymentsOverview = async (params = {}) => {
  const res = await adminApi.get("/admin/operations/payments", { params });
  return res.data?.data || { summary: {}, rows: [] };
};

export const fetchAuditLogs = async (params = {}) => {
  const res = await adminApi.get("/admin/operations/audit-logs", { params });
  return (
    res.data?.data || {
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      rows: [],
    }
  );
};

export const fetchCompletedJobsEvidence = async (params = {}) => {
  const res = await adminApi.get("/admin/operations/completed-jobs", { params });
  return (
    res.data?.data || {
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      rows: [],
    }
  );
};

export const fetchAdminBookings = async (params = {}) => {
  const res = await adminApi.get("/admin/operations/bookings", { params });
  return (
    res.data?.data || {
      summary: {
        UPCOMING: 0,
        HISTORICAL: 0,
        ALERTS_MISSED_ASSIGNMENTS: 0,
        MATCHED_NOT_STARTED: 0,
        STARTED_NOT_COMPLETED: 0,
      },
      rows: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    }
  );
};

export const fetchAdminBookingDetails = async (bookingId) => {
  const res = await adminApi.get(`/admin/operations/bookings/${bookingId}`);
  return res.data?.data || null;
};

export const markAdminBookingPaid = async (bookingId, payload = {}) => {
  const res = await adminApi.patch(`/admin/operations/bookings/${bookingId}/payment`, payload);
  return res.data?.data || null;
};

export const resolveAdminBookingDispute = async (bookingId, disputeId, payload = {}) => {
  const res = await adminApi.patch(
    `/admin/operations/bookings/${bookingId}/disputes/${disputeId}/resolve`,
    payload
  );
  return res.data?.data || null;
};

export const fetchEscalationDashboard = async () => {
  const res = await adminApi.get("/admin/operations/escalations");
  return (
    res.data?.data || {
      summary: {
        stuckUnassigned: 0,
        slaBreached: 0,
        openDisputes: 0,
        unpaidCompleted: 0,
      },
      stuckUnassigned: [],
      slaBreached: [],
      openDisputes: [],
      unpaidCompleted: [],
    }
  );
};

export const fetchSupportRequests = async (params = {}) => {
  const res = await adminApi.get("/admin/operations/support-requests", { params });
  return (
    res.data?.data || {
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      rows: [],
    }
  );
};

export const updateSupportRequestStatus = async (requestId, payload = {}) => {
  const res = await adminApi.patch(`/admin/operations/support-requests/${requestId}/status`, payload);
  return res.data?.data || null;
};

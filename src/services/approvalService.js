import adminApi from "./adminApi";

/* ======================================================
   ADMIN APPROVALS – PROVIDERS
====================================================== */

/**
 * Fetch providers list
 * GET /api/admin/approvals/providers
 */
export const fetchPendingProviders = async (params = {}) => {
  const res = await adminApi.get("/admin/approvals/providers", {
    params,
  });
  return res.data.data;
};

/**
 * Fetch admin notifications for provider onboarding updates
 * GET /api/admin/approvals/notifications
 */
export const fetchApprovalNotifications = async () => {
  const res = await adminApi.get("/admin/approvals/notifications");
  return res.data.data;
};

/**
 * Mark admin approval notifications as read
 * POST /api/admin/approvals/notifications/read
 */
export const markApprovalNotificationsRead = async () => {
  const res = await adminApi.post("/admin/approvals/notifications/read");
  return res.data.data;
};

/**
 * Fetch single provider details
 * GET /api/admin/approvals/providers/:id
 */
export const fetchProviderById = async (id) => {
  const res = await adminApi.get(`/admin/approvals/providers/${id}`);
  return res.data.data;
};

/**
 * Fetch provider audit trail
 * GET /api/admin/approvals/providers/:id/audit
 */
export const fetchProviderAuditTrail = async (id) => {
  const res = await adminApi.get(`/admin/approvals/providers/${id}/audit`);
  return res.data.data;
};

/**
 * Verify provider section
 * POST /api/admin/approvals/providers/:id/verify
 */
export const verifySection = async (
  providerId,
  section,
  status,
  remarks = ""
) => {
  const res = await adminApi.post(
    `/admin/approvals/providers/${providerId}/verify`,
    { section, status, remarks }
  );
  return res.data;
};

/**
 * Approve provider
 * POST /api/admin/approvals/providers/:id/approve
 */
export const approveProvider = async (id) => {
  const res = await adminApi.post(
    `/admin/approvals/providers/${id}/approve`
  );
  return res.data;
};

/**
 * Reject provider
 * POST /api/admin/approvals/providers/:id/reject
 */
export const rejectProvider = async (id, reason) => {
  const res = await adminApi.post(
    `/admin/approvals/providers/${id}/reject`,
    { reason }
  );
  return res.data;
};

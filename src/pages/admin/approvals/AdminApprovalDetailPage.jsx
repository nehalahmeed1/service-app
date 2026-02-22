import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchProviderById,
  approveProvider,
  rejectProvider,
} from "@/services/approvalService";

import VerificationSection from "@/components/admin/approvals/VerificationSection";

export default function AdminApprovalDetailPage() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadProvider = async () => {
    try {
      setLoading(true);
      const data = await fetchProviderById(providerId);
      setProvider(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProvider();
  }, [providerId]);

  if (loading) return <p className="p-6">Loading provider...</p>;
  if (!provider) return <p className="p-6">Provider not found</p>;

  const verification = provider.verification || {};

  const sections = ["profile", "identity", "address", "work", "bank"];

  const verifiedCount = sections.filter(
    (key) => verification[key]?.status === "VERIFIED"
  ).length;

  const canApprove = verifiedCount === sections.length;

  /* ================= ACTIONS ================= */

  const handleApprove = async () => {
    if (!window.confirm("Approve this provider?")) return;
    setActionLoading(true);
    await approveProvider(providerId);
    navigate("/admin/approvals");
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("Rejection reason is required");
      return;
    }
    if (!window.confirm("Reject this provider?")) return;
    setActionLoading(true);
    await rejectProvider(providerId, rejectReason);
    navigate("/admin/approvals");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded shadow p-5 space-y-2">
        <h1 className="text-2xl font-bold">
          Provider Verification
        </h1>

        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <span>
            <strong>Name:</strong> {provider.name}
          </span>
          <span>
            <strong>Email:</strong> {provider.email}
          </span>
          <span>
            <strong>Status:</strong>{" "}
            <StatusBadge status={provider.status} />
          </span>
        </div>

        {/* PROGRESS */}
        <div className="mt-3">
          <p className="text-sm font-medium">
            Verification Progress: {verifiedCount} / {sections.length}
          </p>
          <div className="h-2 bg-gray-200 rounded mt-1">
            <div
              className="h-2 bg-green-600 rounded"
              style={{
                width: `${(verifiedCount / sections.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= VERIFICATION SECTIONS ================= */}
      <VerificationSection
        title="Profile Verification"
        sectionKey="profile"
        data={verification.profile}
        providerId={providerId}
        onUpdate={loadProvider}
      />

      <VerificationSection
        title="Identity Verification"
        sectionKey="identity"
        data={verification.identity}
        providerId={providerId}
        onUpdate={loadProvider}
      />

      <VerificationSection
        title="Address Verification"
        sectionKey="address"
        data={verification.address}
        providerId={providerId}
        onUpdate={loadProvider}
      />

      <VerificationSection
        title="Work Verification"
        sectionKey="work"
        data={verification.work}
        providerId={providerId}
        onUpdate={loadProvider}
      />

      <VerificationSection
        title="Bank Verification"
        sectionKey="bank"
        data={verification.bank}
        providerId={providerId}
        onUpdate={loadProvider}
      />

      {/* ================= FINAL ACTIONS ================= */}
      <div className="bg-white rounded shadow p-5 border-t space-y-4">
        <h2 className="font-semibold text-lg">
          Final Decision
        </h2>

        {/* REJECTION */}
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Rejection reason (required if rejecting)"
          className="w-full border rounded p-3 text-sm"
        />

        <div className="flex gap-3">
          <button
            disabled={!canApprove || actionLoading}
            onClick={handleApprove}
            className={`px-6 py-2 rounded text-white ${
              canApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Approve Provider
          </button>

          <button
            disabled={actionLoading}
            onClick={handleReject}
            className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Reject Provider
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

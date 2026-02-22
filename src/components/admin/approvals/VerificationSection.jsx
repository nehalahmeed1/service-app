import { useState } from "react";
import { verifySection } from "@/services/approvalService";

const API_BASE = "http://localhost:5000";

function toLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function asFileUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE}${path}`;
}

function isImage(path) {
  return /\.(png|jpe?g|webp|gif)$/i.test(path || "");
}

export default function VerificationSection({
  title,
  sectionKey,
  data = {},
  providerId,
  onUpdate,
}) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (status) => {
    try {
      setLoading(true);
      setError("");

      if (status === "REJECTED" && !remarks.trim()) {
        setError("Remarks are required for rejection");
        return;
      }

      await verifySection(providerId, sectionKey, status, remarks.trim());
      setRemarks("");
      onUpdate();
    } catch (err) {
      console.error(err);
      setError("Failed to update verification status");
    } finally {
      setLoading(false);
    }
  };

  const scalarRows = Object.entries(data).filter(([key, value]) => {
    if (["documents", "status", "remarks"].includes(key)) return false;
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return false;
    return true;
  });

  const docs = Array.isArray(data.documents) ? data.documents : [];
  const hasAnyData = scalarRows.length > 0 || docs.length > 0;
  const isAlreadyVerified = data.status === "VERIFIED";

  return (
    <div className="bg-white shadow rounded p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">{title}</h2>
        <StatusBadge status={data.status} />
      </div>

      {scalarRows.length > 0 && (
        <div className="text-sm space-y-1">
          {scalarRows.map(([key, value]) => (
            <p key={key}>
              <strong>{toLabel(key)}:</strong> {String(value)}
            </p>
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc, index) => {
            const url = asFileUrl(doc);
            const imageDoc = isImage(doc);
            return (
              <div key={`${doc}-${index}`} className="space-y-2">
                {imageDoc ? (
                  <img
                    src={url}
                    alt={`${title} Document ${index + 1}`}
                    className="border rounded h-48 w-full object-contain bg-gray-50"
                  />
                ) : (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border rounded p-3 text-sm text-blue-700 hover:underline"
                  >
                    Open document {index + 1}
                  </a>
                )}

                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-700 hover:underline break-all"
                >
                  {doc}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {!hasAnyData && (
        <p className="text-sm text-gray-500">
          No details or documents uploaded yet for this section.
        </p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Admin remarks (required for rejection)"
        className="w-full border rounded p-2"
        rows={3}
      />

      <div className="flex gap-2">
        <button
          disabled={loading || isAlreadyVerified}
          onClick={() => submit("VERIFIED")}
          className={`text-white px-4 py-1 rounded ${
            isAlreadyVerified
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600"
          }`}
        >
          Verify
        </button>

        <button
          disabled={loading}
          onClick={() => submit("REJECTED")}
          className="bg-red-600 text-white px-4 py-1 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status = "PENDING" }) {
  const map = {
    VERIFIED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${map[status] || map.PENDING}`}>
      {status}
    </span>
  );
}

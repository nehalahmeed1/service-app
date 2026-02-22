import { useState } from "react";

export default function ProviderApprovalModal({
  open,
  type, // "approve" | "reject"
  provider,
  onConfirm,
  onClose,
}) {
  const [reason, setReason] = useState("");

  if (!open || !provider) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          {type === "approve"
            ? "Approve Provider"
            : "Reject Provider"}
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          {provider.name} ({provider.email})
        </p>

        {type === "reject" && (
          <textarea
            className="w-full border rounded p-2 mb-4"
            placeholder="Enter rejection reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className={`px-4 py-2 text-white rounded ${
              type === "approve"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

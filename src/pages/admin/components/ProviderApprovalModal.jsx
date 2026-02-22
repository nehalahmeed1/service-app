export default function ProviderApprovalModal({
  open,
  onClose,
  onConfirm,
  provider,
}) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">
          Reject Provider
        </h2>

        <p className="text-sm text-gray-600 mb-3">
          Provider: <strong>{provider?.name}</strong>
        </p>

        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={4}
          placeholder="Enter rejection reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (!reason.trim()) {
                alert("Rejection reason required");
                return;
              }
              onConfirm(reason);
              setReason("");
            }}
            className="px-4 py-2 text-sm rounded bg-red-600 text-white"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

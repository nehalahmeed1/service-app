import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const STATUS_STEPS = [
  "BOOKED",
  "PROVIDER_ASSIGNED",
  "ACCEPTED",
  "ARRIVING",
  "IN_PROGRESS",
  "SERVICE_DONE",
  "PROOF_UPLOADED",
  "COMPLETED",
];

const statusColors = {
  BOOKED: "bg-slate-100 text-slate-700",
  PROVIDER_ASSIGNED: "bg-cyan-100 text-cyan-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  ARRIVING: "bg-sky-100 text-sky-700",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  SERVICE_DONE: "bg-amber-100 text-amber-700",
  PROOF_UPLOADED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

const JobCard = ({
  job,
  onArriving,
  onStart,
  onComplete,
  onCancel,
  onUploadProof,
}) => {
  const { t } = useTranslation();
  const [proofFiles, setProofFiles] = useState([]);
  const [proofNote, setProofNote] = useState("");
  const [uploading, setUploading] = useState(false);

  const statusKey = (job.status || "").toLowerCase();
  const fallbackLabel = (job.status || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const statusLabel = t(statusKey, { defaultValue: fallbackLabel });

  const handleUpload = async () => {
    if (!onUploadProof) return;
    if (!proofFiles.length) {
      alert("Please select at least one image");
      return;
    }

    try {
      setUploading(true);
      await onUploadProof(job.id, proofFiles, proofNote);
      setProofFiles([]);
      setProofNote("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {job.customerName}
          </h3>
          <p className="text-muted-foreground">
            {job.serviceName}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusColors[job.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={16} />
          {job.date}
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Clock" size={16} />
          {job.time}
        </div>
        <div className="flex items-center gap-2">
          <Icon name="MapPin" size={16} />
          {job.address}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Booking Timeline
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUS_STEPS.map((step) => {
            const reached =
              (job.statusHistory || []).some((history) => history.status === step) ||
              job.status === step;
            return (
              <span
                key={step}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  reached
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {step
                  .toLowerCase()
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            );
          })}
        </div>
      </div>

      {job.status === "ACCEPTED" && onStart && (
        <div className="pt-2 flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => onCancel?.(job.id)}>
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onArriving?.(job.id)}>
            {t("mark_arriving", { defaultValue: "Mark Arriving" })}
          </Button>
        </div>
      )}

      {job.status === "ARRIVING" && onStart && (
        <div className="pt-2 flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => onCancel?.(job.id)}>
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="default" size="sm" onClick={() => onStart(job.id)}>
            {t("start_job", { defaultValue: "Start Job" })}
          </Button>
        </div>
      )}

      {job.status === "IN_PROGRESS" && onComplete && (
        <div className="pt-2">
          <Button variant="success" size="sm" onClick={() => onComplete(job.id)}>
            {t("mark_service_done", { defaultValue: "Mark Service Done" })}
          </Button>
        </div>
      )}

      {job.status === "SERVICE_DONE" && onUploadProof && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">
            Upload Completion Proof
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setProofFiles(Array.from(e.target.files || []))}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <textarea
            value={proofNote}
            onChange={(e) => setProofNote(e.target.value)}
            placeholder="Add a completion note (optional)"
            className="h-20 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {job.completionProofImages?.length || 0} proof file(s) uploaded
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Proof"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;

import React from "react";
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

const RequestCard = ({ request, onAccept, onReject }) => {
  const { t } = useTranslation();
  const statusKey = (request.status || "").toLowerCase();
  const fallbackLabel = (request.status || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const statusLabel = t(statusKey, { defaultValue: fallbackLabel });

  return (
    <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {request.customerName}
          </h3>
          <p className="text-muted-foreground">
            {request.serviceName}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusColors[request.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={16} />
          {request.date}
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Clock" size={16} />
          {request.time}
        </div>
        <div className="flex items-center gap-2">
          <Icon name="MapPin" size={16} />
          {request.address}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Booking Timeline
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUS_STEPS.map((step) => {
            const reached =
              (request.statusHistory || []).some((history) => history.status === step) ||
              request.status === step;
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

      {request.status === "PROVIDER_ASSIGNED" && (
        <div className="flex gap-3 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onAccept(request.id)}
          >
            {t("accept")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onReject(request.id)}
          >
            {t("reject")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;

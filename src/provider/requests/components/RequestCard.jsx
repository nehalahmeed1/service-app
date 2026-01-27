import React from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const statusColors = {
  new: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const RequestCard = ({ request, onAccept, onReject }) => {
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
          {request.status.toUpperCase()}
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

      {request.status === "new" && (
        <div className="flex gap-3 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onAccept(request.id)}
          >
            Accept
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onReject(request.id)}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;

import React from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const statusColors = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const JobCard = ({ job, onComplete }) => {
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
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status]}`}
        >
          {job.status.toUpperCase()}
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

      {/* NEW: Complete Job Action */}
      {job.status === "active" && onComplete && (
        <div className="pt-2">
          <Button
            variant="success"
            size="sm"
            onClick={() => onComplete(job.id)}
          >
            Mark as Completed
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobCard;

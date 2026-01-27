import React from "react";

const EarningsList = ({ jobs }) => {
  if (!jobs.length) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No earnings yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-card border rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{job.customerName}</p>
            <p className="text-sm text-muted-foreground">
              {job.serviceName}
            </p>
          </div>

          <div className="font-semibold text-green-600">
            ₹500
          </div>
        </div>
      ))}
    </div>
  );
};

export default EarningsList;

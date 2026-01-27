import React from "react";

const PerformanceSummary = ({ jobs }) => {
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(
    (job) => job.status === "completed"
  ).length;

  const activeJobs = jobs.filter(
    (job) => job.status === "active"
  ).length;

  const completionRate =
    totalJobs === 0
      ? 0
      : Math.round((completedJobs / totalJobs) * 100);

  const avgJobValue = completedJobs === 0 ? 0 : 500;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">Total Jobs</p>
        <p className="text-2xl font-bold">{totalJobs}</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">Completed Jobs</p>
        <p className="text-2xl font-bold">{completedJobs}</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">Completion Rate</p>
        <p className="text-2xl font-bold">{completionRate}%</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">Avg Job Value</p>
        <p className="text-2xl font-bold">₹{avgJobValue}</p>
      </div>

    </div>
  );
};

export default PerformanceSummary;

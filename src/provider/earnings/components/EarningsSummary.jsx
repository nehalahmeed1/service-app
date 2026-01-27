import React from "react";

const EarningsSummary = ({ jobs }) => {
  const totalEarnings = jobs.length * 500; // TEMP flat rate

  const currentMonth = new Date().getMonth();
  const monthlyEarnings = jobs.filter(
    (job) => new Date(job.date).getMonth() === currentMonth
  ).length * 500;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">Total Earnings</p>
        <p className="text-2xl font-bold">₹{totalEarnings}</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">This Month</p>
        <p className="text-2xl font-bold">₹{monthlyEarnings}</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">Completed Jobs</p>
        <p className="text-2xl font-bold">{jobs.length}</p>
      </div>

    </div>
  );
};

export default EarningsSummary;

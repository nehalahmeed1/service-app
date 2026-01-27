import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import EarningsSummary from "./components/EarningsSummary";
import EarningsList from "./components/EarningsList";

const ProviderEarningsPage = () => {
  const [completedJobs, setCompletedJobs] = useState([]);

  useEffect(() => {
    const allJobs =
      JSON.parse(localStorage.getItem("providerJobs")) || [];

    const completed = allJobs.filter(
      (job) => job.status === "completed"
    );

    setCompletedJobs(completed);
  }, []);

  return (
    <>
      <Helmet>
        <title>Earnings - Provider</title>
      </Helmet>

      {/* Width is controlled ONLY by ProviderLayout */}
      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              My Earnings
            </h1>
            <p className="text-muted-foreground">
              Track your completed work and income
            </p>
          </div>

          {/* Summary Cards */}
          <div className="max-w-6xl mb-10">
            <EarningsSummary jobs={completedJobs} />
          </div>

          {/* Earnings List */}
          <div className="max-w-6xl">
            <EarningsList jobs={completedJobs} />
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderEarningsPage;

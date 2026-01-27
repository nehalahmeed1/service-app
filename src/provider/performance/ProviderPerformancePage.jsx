import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import PerformanceSummary from "./components/PerformanceSummary";

const ProviderPerformancePage = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const storedJobs =
      JSON.parse(localStorage.getItem("providerJobs")) || [];
    setJobs(storedJobs);
  }, []);

  return (
    <>
      <Helmet>
        <title>Performance - Provider</title>
      </Helmet>

      {/* Width controlled ONLY by ProviderLayout */}
      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              My Performance
            </h1>
            <p className="text-muted-foreground">
              Track your service quality and growth
            </p>
          </div>

          {/* Performance Grid */}
          <div className="max-w-6xl">
            <PerformanceSummary jobs={jobs} />
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderPerformancePage;

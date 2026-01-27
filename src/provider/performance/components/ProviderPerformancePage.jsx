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

      <div className="min-h-screen bg-background">
        <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">My Performance</h1>
            <p className="text-muted-foreground">
              Track your service quality and growth
            </p>
          </div>

          <PerformanceSummary jobs={jobs} />
        </main>
      </div>
    </>
  );
};

export default ProviderPerformancePage;

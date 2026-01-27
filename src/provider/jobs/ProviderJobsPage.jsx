import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import JobList from "./components/JobList";

const ProviderJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const storedJobs =
      JSON.parse(localStorage.getItem("providerJobs")) || [];
    setJobs(storedJobs);
  }, []);

  const handleComplete = (id) => {
    const updatedJobs = jobs.map((job) =>
      job.id === id ? { ...job, status: "completed" } : job
    );

    setJobs(updatedJobs);
    localStorage.setItem(
      "providerJobs",
      JSON.stringify(updatedJobs)
    );
  };

  const activeJobs = jobs.filter((job) => job.status === "active");
  const completedJobs = jobs.filter(
    (job) => job.status === "completed"
  );

  return (
    <>
      <Helmet>
        <title>My Jobs - Provider</title>
      </Helmet>

      {/* Width controlled ONLY by ProviderLayout */}
      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              My Jobs
            </h1>
            <p className="text-muted-foreground">
              Manage your active and completed work
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
                activeTab === "active"
                  ? "bg-primary text-white border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              Active Jobs ({activeJobs.length})
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
                activeTab === "completed"
                  ? "bg-primary text-white border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              Completed Jobs ({completedJobs.length})
            </button>
          </div>

          {/* Jobs Grid Wrapper */}
          <div className="max-w-6xl">
            {activeTab === "active" && (
              <JobList
                jobs={activeJobs}
                onComplete={handleComplete}
              />
            )}

            {activeTab === "completed" && (
              <JobList jobs={completedJobs} />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderJobsPage;

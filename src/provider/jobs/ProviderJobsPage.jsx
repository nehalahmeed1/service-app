import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import JobList from "./components/JobList";
import {
  fetchProviderJobs,
  updateProviderBookingStatus,
  uploadProviderBookingProof,
  cancelProviderBooking,
} from "@/services/providerBookingService";

const ProviderJobsPage = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProviderJobs();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        const message = err?.response?.data?.message || "Failed to load jobs";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleStart = async (id) => {
    try {
      await updateProviderBookingStatus(id, "IN_PROGRESS");
      setJobs((prev) =>
        prev.map((job) =>
          job.id === id ? { ...job, status: "IN_PROGRESS" } : job
        )
      );
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to start the job";
      alert(message);
    }
  };

  const handleComplete = async (id) => {
    try {
      await updateProviderBookingStatus(id, "SERVICE_DONE");
      setJobs((prev) =>
        prev.map((job) =>
          job.id === id ? { ...job, status: "SERVICE_DONE" } : job
        )
      );
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to update job status";
      alert(message);
    }
  };

  const handleArriving = async (id) => {
    try {
      await updateProviderBookingStatus(id, "ARRIVING");
      setJobs((prev) =>
        prev.map((job) =>
          job.id === id ? { ...job, status: "ARRIVING" } : job
        )
      );
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to update arrival status";
      alert(message);
    }
  };

  const handleProofUpload = async (id, files, note) => {
    try {
      const data = await uploadProviderBookingProof(id, files, note);
      setJobs((prev) =>
        prev.map((job) =>
          job.id === id
            ? {
                ...job,
                status: data?.status || "PROOF_UPLOADED",
                completionProofImages:
                  data?.completionProofImages || job.completionProofImages || [],
                completionProofNote:
                  data?.completionProofNote || job.completionProofNote || "",
              }
            : job
        )
      );
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to upload completion proof";
      alert(message);
    }
  };

  const handleProviderCancel = async (id) => {
    const reason = window.prompt("Enter cancellation reason");
    if (reason === null) return;
    try {
      await cancelProviderBooking(id, reason.trim());
      setJobs((prev) =>
        prev.map((job) => (job.id === id ? { ...job, status: "CANCELLED" } : job))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel booking");
    }
  };

  const activeJobs = jobs.filter((job) =>
    ["ACCEPTED", "ARRIVING", "IN_PROGRESS", "SERVICE_DONE"].includes(job.status)
  );
  const completedJobs = jobs.filter((job) => ["COMPLETED"].includes(job.status));

  return (
    <>
      <Helmet>
        <title>{t("my_jobs")} - {t("provider")}</title>
      </Helmet>

      {/* Width controlled ONLY by ProviderLayout */}
      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {t("my_jobs")}
            </h1>
            <p className="text-muted-foreground">
              {t("my_jobs_subtitle")}
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
              {t("active_jobs")} ({activeJobs.length})
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
                activeTab === "completed"
                  ? "bg-primary text-white border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {t("completed_jobs")} ({completedJobs.length})
            </button>
          </div>

          {/* Jobs Grid Wrapper */}
          {error ? (
            <div className="max-w-6xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="max-w-6xl">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading jobs...
              </div>
            ) : (
              <>
                {activeTab === "active" && (
                  <JobList
                    jobs={activeJobs}
                    onStart={handleStart}
                    onComplete={handleComplete}
                    onArriving={handleArriving}
                    onCancel={handleProviderCancel}
                    onUploadProof={handleProofUpload}
                  />
                )}

                {activeTab === "completed" && (
                  <JobList jobs={completedJobs} onUploadProof={handleProofUpload} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderJobsPage;

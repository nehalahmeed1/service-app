import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import PerformanceSummary from "./components/PerformanceSummary";
import { fetchProviderJobs } from "@/services/providerBookingService";

const ProviderPerformancePage = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const rows = await fetchProviderJobs();
        setJobs(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error("Failed to load provider performance jobs", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("performance")} - {t("provider")}</title>
      </Helmet>

      {/* Width controlled ONLY by ProviderLayout */}
      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {t("my_performance")}
            </h1>
            <p className="text-muted-foreground">
              {t("my_performance_subtitle")}
            </p>
          </div>

          {/* Performance Grid */}
          <div className="max-w-6xl">
            <PerformanceSummary jobs={jobs} loading={loading} />
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderPerformancePage;

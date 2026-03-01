import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import EarningsSummary from "./components/EarningsSummary";
import EarningsList from "./components/EarningsList";
import { fetchProviderJobs } from "@/services/providerBookingService";

const ProviderEarningsPage = () => {
  const { t } = useTranslation();
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompletedJobs = async () => {
      setLoading(true);
      try {
        const jobs = await fetchProviderJobs();
        const completed = (jobs || []).filter(
          (job) => String(job?.status || "").toUpperCase() === "COMPLETED"
        );
        setCompletedJobs(completed);
      } catch (error) {
        console.error("Failed to load provider earnings jobs", error);
        setCompletedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedJobs();
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("earnings")} - {t("provider")}</title>
      </Helmet>

      {/* Width is controlled ONLY by ProviderLayout */}
      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {t("my_earnings")}
            </h1>
            <p className="text-muted-foreground">
              {t("my_earnings_subtitle")}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="max-w-6xl mb-10">
            <EarningsSummary jobs={completedJobs} />
          </div>

          {/* Earnings List */}
          <div className="max-w-6xl">
            <EarningsList jobs={completedJobs} loading={loading} />
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderEarningsPage;

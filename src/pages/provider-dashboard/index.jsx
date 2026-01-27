import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [jobs, setJobs] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const storedJobs =
      JSON.parse(localStorage.getItem("providerJobs")) || [];
    setJobs(storedJobs);

    // TEMP: until backend exists
    setRequests([
      { id: 1, status: "new" },
      { id: 2, status: "new" },
    ]);
  }, []);

  const activeJobs = jobs.filter((j) => j.status === "active");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  const todayEarnings = completedJobs.length * 500;

  const completionRate =
    jobs.length === 0
      ? 0
      : Math.round((completedJobs.length / jobs.length) * 100);

  return (
    <>
      <Helmet>
        <title>{t("provider_dashboard_title")}</title>
      </Helmet>

      <div className="bg-background">
        <main>
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t("provider_dashboard_title")}
            </h1>
            <p className="text-muted-foreground">
              {t("provider_dashboard_subtitle")}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

            {/* New Requests */}
            <div
              onClick={() => navigate("/provider/requests")}
              className="cursor-pointer bg-card border rounded-xl p-5 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {t("provider_new_requests")}
                </p>
                <Icon name="Inbox" size={22} />
              </div>
              <p className="text-3xl font-bold mt-3">
                {requests.length}
              </p>
            </div>

            {/* Active Jobs */}
            <div
              onClick={() => navigate("/provider/jobs")}
              className="cursor-pointer bg-card border rounded-xl p-5 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {t("provider_active_jobs")}
                </p>
                <Icon name="Briefcase" size={22} />
              </div>
              <p className="text-3xl font-bold mt-3">
                {activeJobs.length}
              </p>
            </div>

            {/* Earnings */}
            <div
              onClick={() => navigate("/provider/earnings")}
              className="cursor-pointer bg-card border rounded-xl p-5 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {t("provider_today_earnings")}
                </p>
                <Icon name="Wallet" size={22} />
              </div>
              <p className="text-3xl font-bold mt-3">
                ₹{todayEarnings}
              </p>
            </div>

            {/* Performance */}
            <div
              onClick={() => navigate("/provider/performance")}
              className="cursor-pointer bg-card border rounded-xl p-5 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {t("provider_completion_rate")}
                </p>
                <Icon name="TrendingUp" size={22} />
              </div>
              <p className="text-3xl font-bold mt-3">
                {completionRate}%
              </p>
            </div>

          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl">

            <Button
              onClick={() => navigate("/provider/requests")}
              className="h-12 sm:h-14"
            >
              {t("provider_view_requests")}
            </Button>

            <Button
              onClick={() => navigate("/provider/jobs")}
              className="h-12 sm:h-14"
              variant="outline"
            >
              {t("provider_manage_jobs")}
            </Button>

            <Button
              onClick={() => navigate("/provider/schedule")}
              className="h-12 sm:h-14"
              variant="outline"
            >
              {t("provider_manage_schedule")}
            </Button>

            <Button
              onClick={() => navigate("/provider/earnings")}
              className="h-12 sm:h-14"
              variant="outline"
            >
              {t("provider_view_earnings")}
            </Button>

          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderDashboard;

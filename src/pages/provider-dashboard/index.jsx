import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Icon from "@/components/AppIcon";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { providerOnboardingCompleted, providerStatus } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const storedJobs =
      JSON.parse(localStorage.getItem("providerJobs")) || [];
    setJobs(storedJobs);

    // Temporary data until request APIs are connected.
    setRequests([
      { id: 1, status: "new" },
      { id: 2, status: "new" },
    ]);
  }, []);

  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === "active"),
    [jobs]
  );
  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === "completed"),
    [jobs]
  );
  const todayEarnings = completedJobs.length * 500;
  const completionRate =
    jobs.length === 0
      ? 0
      : Math.round((completedJobs.length / jobs.length) * 100);

  const kpis = [
    {
      key: "requests",
      label: t("provider_new_requests"),
      value: requests.length,
      icon: "Inbox",
      route: "/provider/requests",
      tone: "from-blue-600/10 to-indigo-600/5",
    },
    {
      key: "active",
      label: t("provider_active_jobs"),
      value: activeJobs.length,
      icon: "Briefcase",
      route: "/provider/jobs",
      tone: "from-emerald-600/10 to-green-600/5",
    },
    {
      key: "earnings",
      label: t("provider_today_earnings"),
      value: `Rs ${todayEarnings}`,
      icon: "Wallet",
      route: "/provider/earnings",
      tone: "from-amber-600/10 to-orange-600/5",
    },
    {
      key: "completion",
      label: t("provider_completion_rate"),
      value: `${completionRate}%`,
      icon: "TrendingUp",
      route: "/provider/performance",
      tone: "from-violet-600/10 to-fuchsia-600/5",
    },
  ];

  const quickActions = [
    {
      label: t("provider_view_requests"),
      icon: "Inbox",
      route: "/provider/requests",
      variant: "default",
    },
    {
      label: t("provider_manage_jobs"),
      icon: "BriefcaseBusiness",
      route: "/provider/jobs",
      variant: "outline",
    },
    {
      label: t("provider_manage_schedule"),
      icon: "CalendarDays",
      route: "/provider/schedule",
      variant: "outline",
    },
    {
      label: t("provider_view_earnings"),
      icon: "Wallet",
      route: "/provider/earnings",
      variant: "outline",
    },
    {
      label: "KPI Analytics",
      icon: "LineChart",
      route: "/provider/kpi",
      variant: "outline",
    },
    {
      label: "Growth Hub",
      icon: "Rocket",
      route: "/provider/growth-hub",
      variant: "outline",
    },
    {
      label: "Profile Settings",
      icon: "UserRoundCog",
      route: "/provider/profile",
      variant: "outline",
    },
    {
      label: "Verification Center",
      icon: "BadgeCheck",
      route: "/provider/verification-center",
      variant: "outline",
    },
  ];

  const statusMeta = useMemo(() => {
    if (!providerOnboardingCompleted) {
      return {
        badge: "PENDING",
        title: "Complete onboarding documents",
        description:
          "Your profile is incomplete. Upload all onboarding documents to move forward.",
        className: "border-amber-300 bg-amber-50 text-amber-900",
        badgeClass: "bg-amber-100 text-amber-800",
        cta: {
          label: "Complete Onboarding",
          onClick: () => navigate("/provider/onboarding"),
        },
      };
    }

    if (providerStatus === "REJECTED") {
      return {
        badge: "REJECTED",
        title: "Verification rejected",
        description:
          "Your documents need correction. Re-submit onboarding details to continue.",
        className: "border-red-300 bg-red-50 text-red-900",
        badgeClass: "bg-red-100 text-red-800",
        cta: {
          label: "Open Verification Center",
          onClick: () => navigate("/provider/verification-center"),
        },
      };
    }

    if (providerStatus === "APPROVED") {
      return {
        badge: "VERIFIED",
        title: "Account verified",
        description:
          "All documents are verified. Your provider account is active.",
        className: "border-emerald-300 bg-emerald-50 text-emerald-900",
        badgeClass: "bg-emerald-100 text-emerald-800",
      };
    }

    return {
      badge: "PENDING",
      title: "Verification in progress",
      description:
        "Your onboarding is submitted and currently under admin review.",
      className: "border-blue-300 bg-blue-50 text-blue-900",
      badgeClass: "bg-blue-100 text-blue-800",
      cta: {
        label: "Open Verification Center",
        onClick: () => navigate("/provider/verification-center"),
      },
    };
  }, [navigate, providerOnboardingCompleted, providerStatus]);

  return (
    <>
      <Helmet>
        <title>{t("provider_dashboard_title")}</title>
      </Helmet>

      <main className="space-y-8">
        <section
          className={`rounded-xl border px-4 py-3 sm:px-5 sm:py-4 ${statusMeta.className}`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">{statusMeta.title}</p>
              <p className="text-xs sm:text-sm opacity-90 mt-1">
                {statusMeta.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.badgeClass}`}
              >
                {statusMeta.badge}
              </span>
              {statusMeta.cta && (
                <button
                  onClick={statusMeta.cta.onClick}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-md border border-current hover:bg-white/50"
                >
                  {statusMeta.cta.label}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl border bg-white">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/5 to-transparent pointer-events-none" />
          <div className="relative p-6 sm:p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                <Icon name="Sparkles" size={14} />
                Provider Workspace
              </p>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
                {t("provider_dashboard_title")}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {t("provider_dashboard_subtitle")}
              </p>
            </div>

            <div className="w-full lg:w-auto grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-white/90 px-4 py-3">
                <p className="text-xs text-muted-foreground">Open Requests</p>
                <p className="text-xl font-semibold mt-1">{requests.length}</p>
              </div>
              <div className="rounded-xl border bg-white/90 px-4 py-3">
                <p className="text-xs text-muted-foreground">Job Completion</p>
                <p className="text-xl font-semibold mt-1">{completionRate}%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.route)}
              className={`text-left rounded-2xl border bg-gradient-to-br ${item.tone} p-5 hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold">{item.value}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-white border flex items-center justify-center">
                  <Icon name={item.icon} size={18} />
                </div>
              </div>
            </button>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <span className="text-xs text-muted-foreground">Most used tools</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  onClick={() => navigate(action.route)}
                  variant={action.variant}
                  className="h-12 justify-start gap-2"
                >
                  <Icon name={action.icon} size={16} />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold mb-4">Today's Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Request Response</span>
                  <span className="font-medium">
                    {requests.length > 0 ? "Active" : "Idle"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-primary w-3/4" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Daily Progress</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.max(8, completionRate)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-3">
                <p className="text-xs text-muted-foreground">Estimated Payout</p>
                <p className="text-xl font-semibold mt-1">Rs {todayEarnings}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ProviderDashboard;

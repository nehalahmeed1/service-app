import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import providerApi from "@/services/providerApi";
import Icon from "@/components/AppIcon";

function statusKey(status) {
  if (status === "APPROVED") return "verified";
  return String(status || "PENDING").toLowerCase();
}

export default function ProviderKpiPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [providerStatus, setProviderStatus] = useState("PENDING");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await providerApi.get("/provider/kpi");
        setMetrics(res.data?.data?.metrics || null);
        setProviderStatus(res.data?.data?.providerStatus || "PENDING");
      } catch (err) {
        console.error(err);
        setError(t("failed_load_kpi_metrics"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cards = [
    {
      label: t("profile_completeness"),
      value: `${metrics?.profileCompleteness ?? 0}%`,
      icon: "UserRoundCheck",
      tone: "from-blue-600/10 to-indigo-600/5",
    },
    {
      label: t("uploaded_sections"),
      value: `${metrics?.uploadedSections ?? 0}/5`,
      icon: "FolderCheck",
      tone: "from-emerald-600/10 to-green-600/5",
    },
    {
      label: t("verified_sections"),
      value: metrics?.verifiedSections ?? 0,
      icon: "BadgeCheck",
      tone: "from-cyan-600/10 to-sky-600/5",
    },
    {
      label: t("total_documents"),
      value: metrics?.totalDocuments ?? 0,
      icon: "Files",
      tone: "from-violet-600/10 to-fuchsia-600/5",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t("provider_kpi_analytics")}</title>
      </Helmet>

      <main className="space-y-6">
        <section className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">{t("kpi_analytics")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("kpi_analytics_subtitle")}
          </p>
          <p className="text-xs mt-2">
            <strong>{t("account_status")}:</strong> {t(statusKey(providerStatus))}
          </p>
        </section>

        {loading ? <p className="text-sm">{t("loading_metrics")}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-xl border bg-gradient-to-br ${card.tone} p-4`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <Icon name={card.icon} size={18} />
                  </div>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-5">
                <h2 className="font-semibold text-lg mb-3">{t("verification_mix")}</h2>
                <div className="space-y-3 text-sm">
                  <Row label={t("pending_sections")} value={metrics?.pendingSections ?? 0} />
                  <Row label={t("rejected_sections")} value={metrics?.rejectedSections ?? 0} />
                  <Row label={t("verified_actions")} value={metrics?.verifiedActionCount ?? 0} />
                  <Row label={t("rejection_events")} value={metrics?.rejectionCount ?? 0} />
                </div>
              </div>

              <div className="rounded-xl border bg-white p-5">
                <h2 className="font-semibold text-lg mb-3">{t("account_health")}</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("profile_quality")}</span>
                    <span className="font-medium">{metrics?.profileCompleteness ?? 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.max(8, metrics?.profileCompleteness ?? 0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("account_age")}: {metrics?.accountAgeDays ?? 0} {t("days")}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

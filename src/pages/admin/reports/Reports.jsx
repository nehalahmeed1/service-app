import { useEffect, useMemo, useState } from "react";
import { fetchReportsInsights } from "@/services/adminInsightsService";
import { useTranslation } from "react-i18next";

const RANGES = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

export default function Reports() {
  const { t } = useTranslation();
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetchReportsInsights({ range });
        setData(response || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  const cards = useMemo(() => {
    const summary = data?.summary || {};
    return [
      { label: t("total_providers"), value: summary.totalProviders || 0 },
      { label: t("total_customers"), value: summary.totalCustomers || 0 },
      { label: "Total Bookings", value: summary.totalBookings || 0 },
      { label: "Bookings in Range", value: summary.bookingsInRange || 0 },
      { label: "Cancelled by Customer", value: summary.cancelledByCustomer || 0 },
      { label: "Cancelled by Provider", value: summary.cancelledByProvider || 0 },
    ];
  }, [data, t]);

  const statusRows = useMemo(() => {
    const providerStatus = data?.providerStatus || {};
    const customerStatus = data?.customerStatus || {};
    return [
      { label: t("providers_pending"), value: providerStatus.pending || 0, tone: "bg-amber-500" },
      { label: t("providers_approved"), value: providerStatus.approved || 0, tone: "bg-emerald-500" },
      { label: t("providers_rejected"), value: providerStatus.rejected || 0, tone: "bg-rose-500" },
      { label: t("customers_active"), value: customerStatus.active || 0, tone: "bg-blue-500" },
      { label: t("customers_blocked"), value: customerStatus.blocked || 0, tone: "bg-slate-500" },
    ];
  }, [data, t]);

  const maxStatus = Math.max(1, ...statusRows.map((item) => item.value || 0));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("reports")}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("reports_page_subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((item) => (
            <button
              key={item.value}
              onClick={() => setRange(item.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                range === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.value === "7d" ? t("days_7") : item.value === "30d" ? t("days_30") : t("days_90")}
            </button>
          ))}
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      {loading ? <p className="text-sm">{t("loading_reports")}</p> : null}
      {error ? <p className="text-sm text-red-600">{t("failed_load_reports")}</p> : null}

      {!loading && !error ? (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <article className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">{t("status_distribution")}</h2>
            <div className="mt-4 space-y-3">
              {statusRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100">
                    <div
                      className={`h-2 rounded ${row.tone}`}
                      style={{ width: `${Math.round((row.value / maxStatus) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">{t("top_rejection_reasons")}</h2>
            <div className="mt-4 space-y-3">
              {(data?.rejectionReasons || []).length === 0 ? (
                <p className="text-sm text-slate-500">{t("no_rejection_records")}</p>
              ) : (
                (data?.rejectionReasons || []).map((row) => (
                  <div key={row.reason} className="rounded-lg border bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-900">{row.reason}</p>
                    <p className="text-xs text-slate-600 mt-1">{t("count")}: {row.count}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      ) : null}

      {!loading && !error ? (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <article className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Daily Customer Bookings</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.bookingDaily || []).map((row) => (
                    <tr key={row.date} className="border-t">
                      <td className="px-3 py-2 text-slate-700">{row.date}</td>
                      <td className="px-3 py-2 text-slate-900 font-medium">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Cancellation Reasons</h2>
            <div className="mt-4 space-y-2">
              {(data?.bookingCancellations?.reasons || []).length === 0 ? (
                <p className="text-sm text-slate-500">No cancellation records in selected range</p>
              ) : (
                (data?.bookingCancellations?.reasons || []).map((row, idx) => (
                  <div key={`${row.role}-${row.reason}-${idx}`} className="rounded-lg border bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-900">{row.reason}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Role: {row.role} | Count: {row.count}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      ) : null}

      {!loading && !error ? (
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">{t("approval_activity_timeline")}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">{t("date")}</th>
                  <th className="px-3 py-2 text-left">{t("action")}</th>
                  <th className="px-3 py-2 text-left">{t("count")}</th>
                </tr>
              </thead>
              <tbody>
                {(data?.activityTimeline || []).map((row, index) => (
                  <tr key={`${row.date}-${row.action}-${index}`} className="border-t">
                    <td className="px-3 py-2 text-slate-600">{row.date}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{row.action}</td>
                    <td className="px-3 py-2 text-slate-700">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

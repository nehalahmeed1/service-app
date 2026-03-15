import { useEffect, useMemo, useState } from "react";
import { fetchPaymentsOverview } from "@/services/adminOperationsService";
import { useTranslation } from "react-i18next";

const ELIGIBILITY_FILTERS = ["ALL", "ELIGIBLE", "ON_HOLD"];

function eligibilityBadge(value) {
  if (value === "ELIGIBLE") return "bg-emerald-100 text-emerald-700";
  return "bg-amber-100 text-amber-700";
}

function statusBadge(value) {
  if (value === "VERIFIED") return "bg-emerald-100 text-emerald-700";
  if (value === "REJECTED") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export default function Payments() {
  const { t } = useTranslation();
  const [eligibility, setEligibility] = useState("ALL");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({});
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchPaymentsOverview({
        eligibility,
        search: query.trim(),
      });
      setSummary(data.summary || {});
      setRows(data.rows || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eligibility, query]);

  const cards = useMemo(
    () => [
      { label: t("providers_tracked"), value: summary.totalProviders || 0 },
      { label: t("payout_eligible"), value: summary.eligible || 0 },
      { label: t("on_hold"), value: summary.onHold || 0 },
      { label: t("bank_verified"), value: summary.bankVerified || 0 },
      {
        label: "Customer Paid Total",
        value: `INR ${Number(summary.totalCustomerPaid || 0).toLocaleString()}`,
      },
      {
        label: "Provider Payable Total",
        value: `INR ${Number(summary.totalProviderPayable || 0).toLocaleString()}`,
      },
      {
        label: "Platform Retained Total",
        value: `INR ${Number(summary.totalPlatformRetained || 0).toLocaleString()}`,
      },
      {
        label: "Pending Collection Total",
        value: `INR ${Number(summary.totalPendingCollection || 0).toLocaleString()}`,
      },
    ],
    [summary, t]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">{t("payments_settlements")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("payments_subtitle")}
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border bg-white p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2">
            {ELIGIBILITY_FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setEligibility(item)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  eligibility === item
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t(item.toLowerCase())}
              </button>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search);
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search_provider")}
              className="w-72 rounded-md border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
              {t("search")}
            </button>
          </form>
        </div>

        {loading ? <p className="text-sm">{t("loading_payouts")}</p> : null}
        {error ? <p className="text-sm text-red-600">{t("failed_load_payments")}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">{t("provider")}</th>
                  <th className="px-3 py-2 text-left">{t("eligibility")}</th>
                  <th className="px-3 py-2 text-left">{t("bank_status")}</th>
                  <th className="px-3 py-2 text-left">{t("provider_status")}</th>
                  <th className="px-3 py-2 text-left">Customer Paid</th>
                  <th className="px-3 py-2 text-left">Provider Payable</th>
                  <th className="px-3 py-2 text-left">Platform Retained</th>
                  <th className="px-3 py-2 text-left">Pending Collection</th>
                  <th className="px-3 py-2 text-left">Paid Orders</th>
                  <th className="px-3 py-2 text-left">Pending Verification</th>
                  <th className="px-3 py-2 text-left">{t("hold_reason")}</th>
                  <th className="px-3 py-2 text-left">{t("updated")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{row.providerName}</p>
                      <p className="text-xs text-slate-500">{row.providerEmail}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${eligibilityBadge(row.eligibility)}`}>
                        {row.eligibility}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusBadge(row.bankStatus)}`}>
                        {row.bankStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3">{row.providerStatus}</td>
                    <td className="px-3 py-3 font-semibold">
                      {row.currency} {Number(row.grossCustomerPaid || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {row.currency} {Number(row.payoutAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {row.currency} {Number(row.platformRetained || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {row.currency} {Number(row.pendingCollection || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">{Number(row.paidOrders || 0)}</td>
                    <td className="px-3 py-3">{Number(row.pendingVerificationOrders || 0)}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 max-w-xs">
                      {row.holdReason || "-"}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {new Date(row.lastUpdatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

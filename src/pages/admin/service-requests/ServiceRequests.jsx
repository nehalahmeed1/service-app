import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchServiceRequests } from "@/services/adminOperationsService";
import { useTranslation } from "react-i18next";

const STATUS_FILTERS = ["ALL", "PENDING", "REJECTED"];
const PRIORITY_FILTERS = ["ALL", "HIGH", "MEDIUM", "LOW"];

function statusBadge(status) {
  if (status === "REJECTED") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function priorityBadge(priority) {
  if (priority === "HIGH") return "bg-rose-100 text-rose-700";
  if (priority === "MEDIUM") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function ServiceRequests() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
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
      const data = await fetchServiceRequests({
        status,
        priority,
        search: query.trim(),
      });
      setSummary(data.summary || {});
      setRows(data.rows || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status, priority, query]);

  const cards = useMemo(
    () => [
      { label: t("open_queue"), value: summary.total || 0 },
      { label: t("pending"), value: summary.pending || 0 },
      { label: t("rejected"), value: summary.rejected || 0 },
      { label: t("high_priority"), value: summary.highPriority || 0 },
    ],
    [summary, t]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">{t("service_requests")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("service_requests_subtitle")}
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
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  status === item
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t(item.toLowerCase())}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {PRIORITY_FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setPriority(item)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  priority === item
                    ? "bg-indigo-600 text-white"
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
              placeholder={t("search_provider_or_section")}
              className="w-72 rounded-md border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
              {t("search")}
            </button>
          </form>
        </div>

        {loading ? <p className="text-sm">{t("loading_service_requests")}</p> : null}
        {error ? <p className="text-sm text-red-600">{t("failed_load_service_requests")}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">{t("provider")}</th>
                  <th className="px-3 py-2 text-left">{t("section")}</th>
                  <th className="px-3 py-2 text-left">{t("status")}</th>
                  <th className="px-3 py-2 text-left">{t("priority")}</th>
                  <th className="px-3 py-2 text-left">{t("submitted")}</th>
                  <th className="px-3 py-2 text-left">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{row.providerName}</p>
                      <p className="text-xs text-slate-500">{row.providerEmail}</p>
                    </td>
                    <td className="px-3 py-3 capitalize">{row.section}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${priorityBadge(row.priority)}`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {new Date(row.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/admin/approvals/${row.providerId}`}
                        className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        {t("open_review")}
                      </Link>
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

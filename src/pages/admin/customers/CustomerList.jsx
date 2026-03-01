import { useEffect, useMemo, useState } from "react";
import { fetchCustomersInsights } from "@/services/adminInsightsService";
import { useTranslation } from "react-i18next";

const STATUS_FILTERS = ["ALL", "ACTIVE", "BLOCKED"];

function badge(status) {
  if (status === "BLOCKED") return "bg-rose-100 text-rose-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function CustomerList() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchCustomersInsights({
        status,
        search: query.trim(),
      });
      setSummary(data.summary || null);
      setRows(data.rows || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status, query]);

  const cards = useMemo(
    () => [
      { label: t("total_customers"), value: summary?.total ?? 0 },
      { label: t("active"), value: summary?.active ?? 0 },
      { label: t("blocked"), value: summary?.blocked ?? 0 },
      { label: t("new_30d"), value: summary?.newThisMonth ?? 0 },
    ],
    [summary, t]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">{t("customers")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("customers_page_subtitle")}
        </p>
      </div>

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
              placeholder={t("search_by_name_or_email")}
              className="w-72 rounded-md border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
              {t("search")}
            </button>
          </form>
        </div>

        {loading ? <p className="text-sm">{t("loading_customers")}</p> : null}
        {error ? <p className="text-sm text-red-600">{t("failed_load_customers")}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">{t("customer")}</th>
                  <th className="px-3 py-2 text-left">{t("status")}</th>
                  <th className="px-3 py-2 text-left">{t("joined")}</th>
                  <th className="px-3 py-2 text-left">{t("last_updated")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id} className="border-t">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${badge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {new Date(row.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {new Date(row.updatedAt).toLocaleString()}
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

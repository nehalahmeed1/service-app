import { useEffect, useState } from "react";
import { fetchAuditLogs } from "@/services/adminOperationsService";
import { useTranslation } from "react-i18next";

const STATUS_OPTIONS = ["ALL", "VERIFIED", "REJECTED", "APPROVED"];

function statusBadge(status) {
  if (status === "VERIFIED" || status === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "REJECTED") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function AuditLogs() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("ALL");
  const [action, setAction] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAuditLogs({
        action,
        status,
        search: search.trim(),
        dateFrom,
        dateTo,
        page,
        limit: 20,
      });
      setRows(data.rows || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status, action, page]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">{t("audit_logs")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("audit_logs_subtitle")}
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-5 space-y-4">
        <form
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            load();
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_action_remarks_section")}
            className="rounded-md border px-3 py-2 text-sm xl:col-span-2"
          />
          <input
            value={action === "ALL" ? "" : action}
            onChange={(e) => setAction(e.target.value.trim() || "ALL")}
            placeholder={t("action_example")}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
            {t("apply_filters")}
          </button>
        </form>

        {loading ? <p className="text-sm">{t("loading_audit_logs")}</p> : null}
        {error ? <p className="text-sm text-red-600">{t("failed_load_audit_logs")}</p> : null}

        {!loading && !error ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                  <th className="px-3 py-2 text-left">{t("when")}</th>
                  <th className="px-3 py-2 text-left">{t("action")}</th>
                  <th className="px-3 py-2 text-left">{t("status")}</th>
                  <th className="px-3 py-2 text-left">{t("section")}</th>
                  <th className="px-3 py-2 text-left">{t("provider")}</th>
                  <th className="px-3 py-2 text-left">{t("admin")}</th>
                  <th className="px-3 py-2 text-left">{t("remarks")}</th>
                  <th className="px-3 py-2 text-left">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-3 py-3 text-xs text-slate-500">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900">{row.action}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">{row.section}</td>
                      <td className="px-3 py-3">
                        <p className="text-slate-900">{row.provider?.name || "-"}</p>
                        <p className="text-xs text-slate-500">{row.provider?.email || ""}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-slate-900">{row.admin?.name || "-"}</p>
                        <p className="text-xs text-slate-500">{row.admin?.email || ""}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600 max-w-xs">
                        {row.remarks || "-"}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500">{row.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                {t("showing_page")} {pagination.page} {t("of")} {pagination.totalPages} ({pagination.total} {t("total_logs")})
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="rounded border px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  {t("previous")}
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(pagination.totalPages, prev + 1))
                  }
                  className="rounded border px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  {t("next")}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

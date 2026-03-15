import { useEffect, useState } from "react";
import {
  fetchSupportRequests,
  updateSupportRequestStatus,
} from "@/services/adminOperationsService";

const TYPE_OPTIONS = ["ALL", "CONTACT", "COMPLAINT"];
const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS = ["ALL", "HIGH", "MEDIUM", "LOW"];

function badgeClass(value) {
  if (value === "HIGH" || value === "OPEN") return "bg-rose-100 text-rose-700";
  if (value === "MEDIUM" || value === "IN_PROGRESS") return "bg-amber-100 text-amber-700";
  if (value === "RESOLVED" || value === "CLOSED") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

export default function SupportRequests() {
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [page, setPage] = useState(1);
  const [statusUpdatingId, setStatusUpdatingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchSupportRequests({
        type,
        status,
        priority,
        search: query.trim(),
        page,
        limit: 20,
      });
      setRows(data.rows || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 });
    } catch (err) {
      console.error(err);
      setError("Failed to load support requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type, status, priority, query, page]);

  const handleUpdateStatus = async (row, nextStatus) => {
    try {
      setStatusUpdatingId(row.id);
      await updateSupportRequestStatus(row.id, {
        status: nextStatus,
        resolutionNote: nextStatus === "RESOLVED" ? "Resolved by admin team" : "",
      });
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update request status");
    } finally {
      setStatusUpdatingId("");
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">Support Requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage customer contact queries and complaints with resolution tracking.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setType(item);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-sm ${
                type === item ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setStatus(item);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-sm ${
                status === item ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setPriority(item);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-sm ${
                priority === item ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search);
            setPage(1);
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name/email/subject/message"
            className="h-10 min-w-[280px] rounded-md border px-3 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
            Search
          </button>
        </form>

        {loading ? <p className="text-sm text-slate-500">Loading support requests...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Requester</th>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Priority</th>
                  <th className="px-3 py-2 text-left">Booking</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-3 py-3">{row.type}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{row.subject}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{row.message}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${badgeClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${badgeClass(row.priority)}`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      {row.booking?.id ? (
                        <span>{row.booking.packageCode || row.booking.id}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        disabled={statusUpdatingId === row.id}
                        value={row.status}
                        onChange={(e) => handleUpdateStatus(row, e.target.value)}
                        className="rounded border px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.filter((s) => s !== "ALL").map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.page <= 1}
            className="rounded border px-3 py-1.5 disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded border px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { fetchAdminBookingDetails, fetchAdminBookings } from "@/services/adminOperationsService";
import Icon from "@/components/AppIcon";

const TABS = [
  { key: "UPCOMING", label: "Upcoming" },
  { key: "HISTORICAL", label: "Historical" },
  { key: "ALERTS_MISSED_ASSIGNMENTS", label: "Alerts On Missed Assignments" },
  { key: "MATCHED_NOT_STARTED", label: "Matched But Not Started" },
  { key: "STARTED_NOT_COMPLETED", label: "Started But Not Completed" },
];

const ALERT_TABS = new Set([
  "ALERTS_MISSED_ASSIGNMENTS",
  "MATCHED_NOT_STARTED",
  "STARTED_NOT_COMPLETED",
]);

const STATUS_OPTIONS = [
  "ALL",
  "BOOKED",
  "PROVIDER_ASSIGNED",
  "ACCEPTED",
  "ARRIVING",
  "IN_PROGRESS",
  "SERVICE_DONE",
  "PROOF_UPLOADED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

function formatDateTime(value) {
  if (!value) return "---";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function exportRowsAsCsv(rows) {
  const headers = [
    "Order ID",
    "Booking Type",
    "Scheduled Date",
    "Scheduled Time",
    "Customer Name",
    "Customer Email",
    "Address",
    "Service",
    "Worker Name",
    "City",
    "Status",
  ];

  const lines = rows.map((row) =>
    [
      row.orderId,
      row.bookingType,
      row.scheduledDate,
      row.scheduledTime,
      row.customerName,
      row.customerEmail,
      row.address,
      row.serviceName,
      row.workerName,
      row.city,
      row.status,
    ]
      .map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `admin-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Timeline({ title, value }) {
  return (
    <div className="flex-1 min-w-[120px]">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value || "---"}</p>
    </div>
  );
}

function slaClass(state) {
  if (state === "BREACHED") return "bg-rose-100 text-rose-700 border-rose-200";
  if (state === "WARNING") return "bg-amber-100 text-amber-700 border-amber-200";
  if (state === "ON_TRACK") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (state === "MET") return "bg-blue-100 text-blue-700 border-blue-200";
  if (state === "CLOSED") return "bg-slate-200 text-slate-700 border-slate-300";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function AdminBookings() {
  const [tab, setTab] = useState("UPCOMING");
  const [status, setStatus] = useState("ALL");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({});
  const [slaSummary, setSlaSummary] = useState({ breached: 0, warning: 0, onTrack: 0 });
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminBookings({
        tab,
        status,
        city: city.trim() || "ALL",
        search: query.trim(),
        dateFrom,
        dateTo,
        page,
        limit: 20,
      });
      setSummary(data.summary || {});
      setSlaSummary(data.slaSummary || { breached: 0, warning: 0, onTrack: 0 });
      setRows(data.rows || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 });
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab, status, query, dateFrom, dateTo, city, page]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          load();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, tab, status, query, dateFrom, dateTo, city, page]);

  useEffect(() => {
    setCountdown(60);
  }, [tab, status, query, dateFrom, dateTo, city, page]);

  useEffect(() => {
    if (!selectedBookingId) return undefined;
    const loadDetails = async () => {
      try {
        setDetailsLoading(true);
        const data = await fetchAdminBookingDetails(selectedBookingId);
        setDetails(data);
      } catch (err) {
        console.error(err);
        setDetails(null);
      } finally {
        setDetailsLoading(false);
      }
    };
    loadDetails();
    return undefined;
  }, [selectedBookingId]);

  const headerTabs = useMemo(
    () =>
      TABS.map((item) => ({
        ...item,
        count: Number(summary[item.key] || 0),
      })),
    [summary]
  );

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {headerTabs.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setTab(item.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                tab === item.key
                  ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
              {ALERT_TABS.has(item.key) && item.count > 0 ? (
                <span className="ml-2 inline-flex rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">
                  {item.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border px-3 text-sm"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="h-10 rounded-md border px-3 text-sm"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking id / address"
            className="h-10 min-w-[240px] rounded-md border px-3 text-sm"
          />

          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 rounded-md border px-3 text-sm" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 rounded-md border px-3 text-sm" />

          <button
            onClick={() => {
              setQuery(search);
              setPage(1);
            }}
            className="h-10 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white"
          >
            Search
          </button>

          <button
            onClick={() => exportRowsAsCsv(rows)}
            className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-medium text-white"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-3 flex items-center justify-end gap-4 text-sm text-slate-600">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Enable Auto-Refresh (every 1 minute)
          </label>
          <span>{autoRefresh ? `Refreshing in ${countdown} seconds` : "Auto-refresh off"}</span>
          <button onClick={load} className="rounded border p-2 hover:bg-slate-50" title="Refresh now">
            <Icon name="RefreshCw" size={15} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs uppercase tracking-wide text-rose-700">SLA Breached</p>
            <p className="mt-1 text-2xl font-bold text-rose-800">{slaSummary.breached || 0}</p>
          </article>
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs uppercase tracking-wide text-amber-700">SLA Warning</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{slaSummary.warning || 0}</p>
          </article>
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs uppercase tracking-wide text-emerald-700">On Track</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">{slaSummary.onTrack || 0}</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-3 sm:p-5">
        {loading ? <p className="text-sm text-slate-600">Loading bookings...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Order ID</th>
                  <th className="px-3 py-2 text-left">Booking Type</th>
                  <th className="px-3 py-2 text-left">Scheduled Time</th>
                  <th className="px-3 py-2 text-left">Customer Details</th>
                  <th className="px-3 py-2 text-left">Address</th>
                  <th className="px-3 py-2 text-left">Services</th>
                  <th className="px-3 py-2 text-left">Worker Name</th>
                  <th className="px-3 py-2 text-left">Hub Name</th>
                  <th className="px-3 py-2 text-left">SLA</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-blue-700">{row.orderId}</p>
                      <p className="text-[11px] text-slate-500">{formatDateTime(row.createdAt)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs">{row.bookingType}</span>
                    </td>
                    <td className="px-3 py-3">
                      <p>{row.scheduledDate || "-"}</p>
                      <p>{row.scheduledTime || "-"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{row.customerName}</p>
                      <p className="text-xs text-slate-600">{row.customerEmail}</p>
                    </td>
                    <td className="px-3 py-3 text-blue-700 underline underline-offset-2">{row.address}</td>
                    <td className="px-3 py-3">{row.serviceName}</td>
                    <td className="px-3 py-3">{row.workerName || "N/A"}</td>
                    <td className="px-3 py-3">{row.city || "-"}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${slaClass(
                          row.sla?.state
                        )}`}
                      >
                        {row.sla?.label || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setSelectedBookingId(row.id)}
                        className="rounded border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.page <= 1}
            className="rounded border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>

      {selectedBookingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
              <h2 className="text-xl font-semibold">
                Booking Details {details?.bookingRef ? <span className="text-sm text-blue-700">#{details.bookingRef}</span> : null}
              </h2>
              <button onClick={() => setSelectedBookingId(null)} className="rounded border p-1.5">
                <Icon name="X" size={16} />
              </button>
            </div>

            {detailsLoading ? <p className="p-4 text-sm">Loading details...</p> : null}
            {!detailsLoading && details ? (
              <div className="space-y-4 p-4">
                <section className="rounded-lg border bg-slate-50 p-4">
                  <div className="flex flex-wrap gap-4">
                    <Timeline title="Created" value={formatDateTime(details.timeline?.createdAt)} />
                    <Timeline title="Scheduled" value={details.timeline?.scheduledAt || "---"} />
                    <Timeline title="Matched" value={formatDateTime(details.timeline?.matchedAt)} />
                    <Timeline title="Started" value={formatDateTime(details.timeline?.startedAt)} />
                    <Timeline title="Completed" value={formatDateTime(details.timeline?.completedAt)} />
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <article className="rounded-lg border p-4">
                    <h3 className="font-semibold">Customer</h3>
                    <p className="mt-2 text-sm">{details.customer?.name || "N/A"}</p>
                    <p className="text-xs text-slate-600">{details.customer?.email || ""}</p>
                  </article>

                  <article className="rounded-lg border p-4">
                    <h3 className="font-semibold">Booking Details</h3>
                    <p className="mt-2 text-sm">Ref: {details.bookingRef}</p>
                    <p className="text-sm">Type: {details.type}</p>
                    <p className="text-sm">Status: {details.status}</p>
                    <p className="text-sm">Service: {details.serviceName || "-"}</p>
                    <p className="text-sm">Price: Rs {details.price || 0}</p>
                  </article>

                  <article className="rounded-lg border p-4">
                    <h3 className="font-semibold">Worker (Partner)</h3>
                    <p className="mt-2 text-sm">{details.worker?.name || "N/A"}</p>
                    <p className="text-xs text-slate-600">{details.worker?.phone || ""}</p>
                    <p className="text-xs text-slate-600">{details.worker?.email || ""}</p>
                  </article>
                </section>

                <section className="rounded-lg border p-4">
                  <h3 className="font-semibold">SLA Status</h3>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${slaClass(
                        details.sla?.state
                      )}`}
                    >
                      {details.sla?.label || "N/A"}
                    </span>
                  </div>
                </section>

                <section className="rounded-lg border p-4">
                  <h3 className="font-semibold">Address</h3>
                  <p className="mt-2 text-sm">{details.address || "-"}</p>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

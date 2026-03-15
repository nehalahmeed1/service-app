import { useEffect, useState } from "react";
import { fetchEscalationDashboard } from "@/services/adminOperationsService";

function Table({ title, rows, columns }) {
  return (
    <section className="rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No records.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-3 py-2 text-left">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {columns.map((col) => (
                    <td key={`${row.id}-${col.key}`} className="px-3 py-3">
                      {col.render ? col.render(row[col.key], row) : row[col.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function Escalations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    summary: {
      stuckUnassigned: 0,
      slaBreached: 0,
      openDisputes: 0,
      unpaidCompleted: 0,
    },
    stuckUnassigned: [],
    slaBreached: [],
    openDisputes: [],
    unpaidCompleted: [],
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchEscalationDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
      setError("Failed to load escalation dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">Escalation Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track high-risk operational cases requiring immediate attention.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Stuck Unassigned" value={data.summary?.stuckUnassigned || 0} tone="rose" />
        <Card label="SLA Breached" value={data.summary?.slaBreached || 0} tone="amber" />
        <Card label="Open Disputes" value={data.summary?.openDisputes || 0} tone="orange" />
        <Card label="Unpaid Completed" value={data.summary?.unpaidCompleted || 0} tone="indigo" />
      </section>

      {loading ? <p className="text-sm text-slate-500">Loading escalations...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <>
          <Table
            title="Stuck Unassigned Bookings"
            rows={data.stuckUnassigned || []}
            columns={[
              { key: "serviceName", label: "Service" },
              { key: "bookingDate", label: "Date" },
              { key: "timeSlot", label: "Slot" },
              {
                key: "createdAt",
                label: "Created",
                render: (value) => (value ? new Date(value).toLocaleString() : "-"),
              },
            ]}
          />

          <Table
            title="SLA Breached Cases"
            rows={data.slaBreached || []}
            columns={[
              { key: "serviceName", label: "Service" },
              { key: "status", label: "Status" },
              {
                key: "sla",
                label: "SLA",
                render: (_, row) => row.sla?.label || "-",
              },
              {
                key: "createdAt",
                label: "Created",
                render: (value) => (value ? new Date(value).toLocaleString() : "-"),
              },
            ]}
          />

          <Table
            title="Open Disputes"
            rows={data.openDisputes || []}
            columns={[
              { key: "serviceName", label: "Service" },
              {
                key: "disputes",
                label: "Dispute Count",
                render: (value) => value?.length || 0,
              },
              {
                key: "updatedAt",
                label: "Updated",
                render: (value) => (value ? new Date(value).toLocaleString() : "-"),
              },
            ]}
          />

          <Table
            title="Completed But Unpaid"
            rows={data.unpaidCompleted || []}
            columns={[
              { key: "serviceName", label: "Service" },
              {
                key: "amount",
                label: "Amount",
                render: (value) => `Rs ${Number(value || 0).toLocaleString()}`,
              },
              { key: "paymentStatus", label: "Payment Status" },
              {
                key: "completedAt",
                label: "Completed At",
                render: (value) => (value ? new Date(value).toLocaleString() : "-"),
              },
            ]}
          />
        </>
      ) : null}
    </div>
  );
}

function Card({ label, value, tone = "slate" }) {
  const toneClass =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : tone === "orange"
      ? "border-orange-200 bg-orange-50 text-orange-800"
      : "border-indigo-200 bg-indigo-50 text-indigo-800";

  return (
    <article className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}

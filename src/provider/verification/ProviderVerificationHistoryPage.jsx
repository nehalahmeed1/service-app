import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import providerApi from "@/services/providerApi";

function statusClass(status) {
  if (status === "VERIFIED" || status === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default function ProviderVerificationHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [providerStatus, setProviderStatus] = useState("PENDING");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await providerApi.get("/provider/verification/history");
        const data = res.data?.data || {};
        setTimeline(data.timeline || []);
        setProviderStatus(data.providerStatus || "PENDING");
      } catch (err) {
        console.error(err);
        setError("Failed to load verification history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Helmet>
        <title>Verification History</title>
      </Helmet>

      <main className="space-y-5">
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Verification History</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Timeline of document verification and admin decisions.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(
                providerStatus
              )}`}
            >
              {providerStatus}
            </span>
          </div>
        </section>

        {loading ? <p className="text-sm">Loading history...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error && timeline.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-muted-foreground">
            No verification events yet.
          </div>
        ) : null}

        <section className="space-y-3">
          {timeline.map((event) => (
            <article key={event.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold">{event.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.section ? `Section: ${event.section}` : "Final decision"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${statusClass(
                    event.status
                  )}`}
                >
                  {event.status || "PENDING"}
                </span>
              </div>

              {event.remarks ? (
                <p className="mt-2 text-sm">
                  <strong>Remarks:</strong> {event.remarks}
                </p>
              ) : null}

              <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span>{new Date(event.createdAt).toLocaleString()}</span>
                {event.admin?.name ? <span>By: {event.admin.name}</span> : null}
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

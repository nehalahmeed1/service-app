import { useEffect, useState } from "react";
import { fetchCompletedJobsEvidence } from "@/services/adminOperationsService";

function isImage(path) {
  return /\.(png|jpe?g|webp|gif)$/i.test(path || "");
}

function toAbsoluteUploadUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const apiRoot = apiBase.replace(/\/api\/?$/, "");
  return `${apiRoot}${path}`;
}

export default function CompletedJobsEvidence() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [withProofOnly, setWithProofOnly] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchCompletedJobsEvidence({
        search: search.trim(),
        withProofOnly: withProofOnly ? "true" : "false",
      });
      setRows(data.rows || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load completed jobs evidence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, withProofOnly]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">Completed Jobs Evidence</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review provider uploaded completion proof before/after job closure.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-5 space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
            }}
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search package code or address"
              className="w-80 rounded-md border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
              Search
            </button>
          </form>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={withProofOnly}
              onChange={(e) => setWithProofOnly(e.target.checked)}
            />
            Show only jobs with proof files
          </label>
        </div>

        {loading ? <p className="text-sm">Loading completed jobs evidence...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error ? (
          <div className="space-y-4">
            {rows.length === 0 ? (
              <p className="text-sm text-slate-500">No completed jobs found for current filters.</p>
            ) : (
              rows.map((row) => (
                <article key={row.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {row.subCategoryName || row.packageCode}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.categoryName ? `${row.categoryName} / ` : ""}
                        {row.packageCode}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Provider: {row.provider?.name || "-"} ({row.provider?.email || "-"})
                      </p>
                      <p className="text-xs text-slate-500">
                        Customer: {row.customer?.name || "-"} ({row.customer?.email || "-"})
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">
                      <p>Booked: {row.bookingDate} {row.timeSlot}</p>
                      <p>Completed: {new Date(row.completedAt).toLocaleString()}</p>
                      <p>Status: {row.status}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm">
                    <span className="font-medium">Address:</span> {row.address}
                  </p>

                  <p className="mt-2 text-sm">
                    <span className="font-medium">Proof Note:</span>{" "}
                    {row.completionProofNote || "No note added"}
                  </p>

                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">
                      Proof Files ({row.completionProofImages?.length || 0})
                    </p>

                    {row.completionProofImages?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {row.completionProofImages.map((path, idx) => {
                          const fileUrl = toAbsoluteUploadUrl(path);
                          return (
                            <a
                              key={`${row.id}-${idx}`}
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-md border overflow-hidden hover:shadow"
                            >
                              {isImage(path) ? (
                                <img
                                  src={fileUrl}
                                  alt={`Proof ${idx + 1}`}
                                  className="h-28 w-full object-cover"
                                />
                              ) : (
                                <div className="h-28 w-full flex items-center justify-center text-xs text-slate-600 px-2 text-center">
                                  Open file {idx + 1}
                                </div>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No proof files uploaded.</p>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}

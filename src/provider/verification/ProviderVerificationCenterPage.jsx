import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import providerApi from "@/services/providerApi";
import Icon from "@/components/AppIcon";

const LABELS = {
  profile: "Profile",
  identity: "Identity",
  address: "Address",
  work: "Work",
  bank: "Bank",
};

const badgeMap = {
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
};

export default function ProviderVerificationCenterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await providerApi.get("/provider/onboarding/status");
      setSummary(res.data?.data || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load verification status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const overall = useMemo(() => {
    if (!summary) return "PENDING";
    if (summary.providerStatus === "APPROVED") return "VERIFIED";
    if (summary.providerStatus === "REJECTED") return "REJECTED";
    return "PENDING";
  }, [summary]);

  if (loading) return <p className="p-2 text-sm">Loading verification center...</p>;
  if (error) return <p className="p-2 text-sm text-red-600">{error}</p>;

  return (
    <>
      <Helmet>
        <title>Verification Center</title>
      </Helmet>

      <main className="space-y-6">
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Verification Center</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage onboarding documents and verification progress.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold ${badgeMap[overall] || badgeMap.PENDING}`}
              >
                {overall}
              </span>
              <button
                onClick={() => navigate("/provider/verification-history")}
                className="px-3 py-1.5 rounded-md border text-xs sm:text-sm"
              >
                View History
              </button>
            </div>
          </div>

          {summary?.missingSections?.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Missing sections: {summary.missingSections.join(", ")}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(summary?.sections || []).map((section) => (
            <article key={section.key} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{LABELS[section.key] || section.key}</h2>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${badgeMap[section.status] || badgeMap.PENDING}`}
                >
                  {section.status}
                </span>
              </div>

              <div className="mt-3 text-sm space-y-1">
                <p>
                  <strong>Uploaded:</strong> {section.uploaded ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Documents:</strong> {section.documentCount}
                </p>
                {section.remarks ? (
                  <p>
                    <strong>Remarks:</strong> {section.remarks}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate(`/provider/onboarding?step=${section.step}`)
                  }
                  className="px-3 py-2 rounded-md bg-primary text-white text-sm hover:opacity-90"
                >
                  {section.uploaded ? "Edit / Re-upload" : "Upload Documents"}
                </button>
                <button
                  onClick={loadStatus}
                  className="px-3 py-2 rounded-md border text-sm"
                >
                  <Icon name="RefreshCw" size={14} className="inline mr-1" />
                  Refresh
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

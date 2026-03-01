import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const hasValue = (value) => String(value ?? "").trim() !== "";

function isSectionComplete(section) {
  const data = section?.data || {};
  const docCount = Number(section?.documentCount || 0);

  switch (section?.key) {
    case "profile":
      return hasValue(data.fullName) && hasValue(data.phone) && docCount >= 1;

    case "identity":
      return hasValue(data.aadhaarNumber) && docCount >= 2;

    case "address":
      return (
        hasValue(data.addressLine) &&
        hasValue(data.city) &&
        hasValue(data.state) &&
        hasValue(data.pincode) &&
        docCount >= 1
      );

    case "work":
      return hasValue(data.categoryId) && hasValue(data.experienceYears) && docCount >= 1;

    case "bank":
      return (
        hasValue(data.accountHolderName) &&
        hasValue(data.accountNumber) &&
        hasValue(data.ifscCode) &&
        docCount >= 1
      );

    default:
      return false;
  }
}

function statusKey(status) {
  if (status === "APPROVED") return "verified";
  return String(status || "PENDING").toLowerCase();
}

export default function ProviderVerificationCenterPage() {
  const { t } = useTranslation();
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
      setError(t("failed_load_verification_status"));
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

  const allSectionsUploaded = useMemo(
    () => (summary?.sections || []).every((section) => isSectionComplete(section)),
    [summary]
  );

  if (loading) return <p className="p-2 text-sm">{t("loading_verification_center")}</p>;
  if (error) return <p className="p-2 text-sm text-red-600">{error}</p>;

  return (
    <>
      <Helmet>
        <title>{t("verification_center")}</title>
      </Helmet>

      <main className="space-y-6">
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{t("verification_center")}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("verification_center_subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold ${badgeMap[overall] || badgeMap.PENDING}`}
              >
                {t(statusKey(overall))}
              </span>
              <button
                onClick={() => navigate("/provider/verification-history")}
                className="px-3 py-1.5 rounded-md border text-xs sm:text-sm"
              >
                {t("view_history")}
              </button>
            </div>
          </div>

          {summary?.missingSections?.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {t("missing_sections")}: {summary.missingSections.map((item) => t(String(item).toLowerCase())).join(", ")}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(summary?.sections || []).map((section) => (
            <article key={section.key} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{t((LABELS[section.key] || section.key).toLowerCase())}</h2>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${badgeMap[section.status] || badgeMap.PENDING}`}
                >
                  {t(statusKey(section.status))}
                </span>
              </div>

              <div className="mt-3 text-sm space-y-1">
                <p>
                  <strong>{t("uploaded")}:</strong> {section.uploaded ? t("yes") : t("no")}
                </p>
                <p>
                  <strong>{t("documents")}:</strong> {section.documentCount}
                </p>
                {section.remarks ? (
                  <p>
                    <strong>{t("remarks")}:</strong> {section.remarks}
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
                  {section.uploaded ? t("edit_reupload") : t("upload_documents")}
                </button>
                <button
                  onClick={loadStatus}
                  className="px-3 py-2 rounded-md border text-sm"
                >
                  <Icon name="RefreshCw" size={14} className="inline mr-1" />
                  {t("refresh")}
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-xl border bg-white p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-semibold">Final Submit</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {allSectionsUploaded
                  ? "All sections are uploaded. Continue to final submission."
                  : `Complete ${summary?.missingSections?.length || 0} remaining section(s) to unlock final submit.`}
              </p>
            </div>
            <button
              onClick={() => navigate("/provider/onboarding?step=5")}
              disabled={!allSectionsUploaded}
              className={`px-4 py-2 rounded-md text-sm ${
                allSectionsUploaded
                  ? "bg-primary text-white hover:opacity-90"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Go to Submit
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

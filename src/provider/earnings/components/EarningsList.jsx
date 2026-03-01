import { useTranslation } from "react-i18next";

export default function EarningsList({ jobs, loading = false }) {
  const { t } = useTranslation();

  if (loading) {
    return <div className="text-center text-muted-foreground py-12">Loading...</div>;
  }

  if (!jobs.length) {
    return <div className="text-center text-muted-foreground py-12">{t("no_earnings_yet")}</div>;
  }

  return (
    <div className="space-y-3">
      {jobs.map((job, index) => (
        <div
          key={job.id || `${job.customerName}-${index}`}
          className="bg-card border rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{job.customerName}</p>
            <p className="text-sm text-muted-foreground">{job.serviceName}</p>
          </div>

          <div className="font-semibold text-green-600">Rs {Number(job?.price || 0)}</div>
        </div>
      ))}
    </div>
  );
}

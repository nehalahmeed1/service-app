import { useTranslation } from "react-i18next";

export default function PerformanceSummary({ jobs, loading = false }) {
  const { t } = useTranslation();
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(
    (job) => String(job?.status || "").toUpperCase() === "COMPLETED"
  ).length;
  const completionRate = totalJobs === 0 ? 0 : Math.round((completedJobs / totalJobs) * 100);
  const completedValue = jobs
    .filter((job) => String(job?.status || "").toUpperCase() === "COMPLETED")
    .reduce((sum, job) => sum + Number(job?.price || 0), 0);
  const avgJobValue = completedJobs === 0 ? 0 : Math.round(completedValue / completedJobs);

  if (loading) {
    return <div className="text-center text-muted-foreground py-12">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">{t("total_jobs")}</p>
        <p className="text-2xl font-bold">{totalJobs}</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">{t("completed_jobs")}</p>
        <p className="text-2xl font-bold">{completedJobs}</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">{t("completion_rate")}</p>
        <p className="text-2xl font-bold">{completionRate}%</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">{t("avg_job_value")}</p>
        <p className="text-2xl font-bold">Rs {avgJobValue}</p>
      </div>
    </div>
  );
}

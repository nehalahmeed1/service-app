import { useTranslation } from "react-i18next";

export default function EarningsSummary({ jobs }) {
  const { t } = useTranslation();
  const totalEarnings = jobs.reduce(
    (sum, job) => sum + Number(job?.price || 0),
    0
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyEarnings = jobs
    .filter((job) => {
      const sourceDate = job?.updatedAt || job?.date || job?.createdAt;
      const d = new Date(sourceDate);
      return (
        !Number.isNaN(d.getTime()) &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, job) => sum + Number(job?.price || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">{t("total_earnings")}</p>
        <p className="text-2xl font-bold">Rs {totalEarnings}</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">{t("this_month")}</p>
        <p className="text-2xl font-bold">Rs {monthlyEarnings}</p>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">{t("completed_jobs")}</p>
        <p className="text-2xl font-bold">{jobs.length}</p>
      </div>
    </div>
  );
}

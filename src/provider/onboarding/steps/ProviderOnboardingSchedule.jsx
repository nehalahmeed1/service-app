import { useTranslation } from "react-i18next";

export default function ProviderOnboardingSchedule({ onBack, onNext }) {
  const { t } = useTranslation();

  return (
    <div className="bg-card border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-2">
        {t("schedule_title")}
      </h2>

      <p className="text-muted-foreground mb-6">
        {t("schedule_subtitle")}
      </p>

      <div className="flex gap-4 mb-6">
        <input type="time" className="border rounded-lg px-3 py-2" />
        <input type="time" className="border rounded-lg px-3 py-2" />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="border px-6 py-2 rounded-lg"
        >
          {t("back")}
        </button>

        <button
          onClick={onNext}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
}

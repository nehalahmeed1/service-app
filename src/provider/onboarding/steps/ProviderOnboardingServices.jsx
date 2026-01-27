import { useTranslation } from "react-i18next";

export default function ProviderOnboardingServices({ onNext, onBack }) {
  const { t } = useTranslation();

  return (
    <div className="bg-card border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-2">
        {t("onboarding_services")}
      </h2>

      <p className="text-muted-foreground mb-6">
        {t("onboarding_services_subtitle")}
      </p>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          {t("service_ac_repair")}
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" />
          {t("service_home_cleaning")}
        </label>
      </div>

      <div className="flex justify-between mt-6">
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
 
import { useTranslation } from "react-i18next";

export default function ProviderOnboardingFinish({ onFinish }) {
  const { t } = useTranslation();

  return (
    <div className="bg-card border rounded-xl p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">
        {t("onboarding_complete")}
      </h2>

      <p className="text-muted-foreground mb-6">
        {t("onboarding_complete_subtitle")}
      </p>

      <button
        onClick={onFinish}
        className="bg-primary text-white px-8 py-3 rounded-lg"
      >
        {t("finish_setup")}
      </button>
    </div>
  );
}

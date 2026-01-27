import { useTranslation } from "react-i18next";

export default function ProviderOnboardingProfile({ onNext }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          {t("profile_setup")}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t("profile_setup_subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder={t("fullName")}
          className="w-full border border-input rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        />

        <input
          placeholder={t("phoneNumber")}
          className="w-full border border-input rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
}

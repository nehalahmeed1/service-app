import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ProviderOnboardingFinish({ onFinish }) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!window.confirm(t("submit_profile_confirmation"))) {
      return;
    }

    try {
      setSubmitting(true);
      await onFinish();
    } catch (err) {
      console.error("Onboarding submission failed:", err);
      alert(t("submission_failed_try_again"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-8 text-center space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
        <span className="text-yellow-600 text-2xl">...</span>
      </div>

      <h2 className="text-xl font-semibold">{t("submit_for_verification")}</h2>

      <p className="text-muted-foreground">{t("submit_for_verification_desc")}</p>

      <div className="bg-gray-50 border rounded-lg p-4 text-sm text-left">
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("verification_note_identity_address")}</li>
          <li>{t("verification_note_work")}</li>
          <li>{t("verification_note_bank")}</li>
        </ul>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`px-8 py-3 rounded-lg text-white ${
          submitting ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:opacity-90"
        }`}
      >
        {submitting ? t("submitting") : t("submit_for_approval")}
      </button>

      <p className="text-xs text-gray-500">{t("cannot_accept_jobs_until_approved")}</p>
    </div>
  );
}

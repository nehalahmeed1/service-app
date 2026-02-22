import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ProviderOnboardingFinish({ onFinish }) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!window.confirm("Submit profile for admin verification?")) {
      return;
    }

    try {
      setSubmitting(true);

      /**
       * 🔐 IMPORTANT (Next backend step):
       * - Upload all collected documents
       * - Save provider.verification object
       * - Set provider.status = PENDING
       */

      await onFinish();
    } catch (err) {
      console.error("Onboarding submission failed:", err);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-8 text-center space-y-4">
      {/* ICON / STATUS */}
      <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
        <span className="text-yellow-600 text-2xl">⏳</span>
      </div>

      {/* TITLE */}
      <h2 className="text-xl font-semibold">
        Submit for Verification
      </h2>

      {/* DESCRIPTION */}
      <p className="text-muted-foreground">
        Your profile and documents will be reviewed by our admin team.
        You’ll be notified once your account is approved.
      </p>

      {/* INFO BOX */}
      <div className="bg-gray-50 border rounded-lg p-4 text-sm text-left">
        <ul className="list-disc pl-5 space-y-1">
          <li>Identity & address documents will be verified</li>
          <li>Work experience will be reviewed</li>
          <li>Bank details are required for payouts</li>
        </ul>
      </div>

      {/* ACTION */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`px-8 py-3 rounded-lg text-white ${
          submitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primary hover:opacity-90"
        }`}
      >
        {submitting ? "Submitting..." : "Submit for Approval"}
      </button>

      {/* NOTE */}
      <p className="text-xs text-gray-500">
        You won’t be able to accept jobs until approved.
      </p>
    </div>
  );
}

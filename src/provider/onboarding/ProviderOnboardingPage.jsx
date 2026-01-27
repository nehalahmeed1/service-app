import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doc, updateDoc } from "firebase/firestore";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";

import ProviderOnboardingProfile from "./steps/ProviderOnboardingProfile";
import ProviderOnboardingServices from "./steps/ProviderOnboardingServices";
import ProviderOnboardingSchedule from "./steps/ProviderOnboardingSchedule";
import ProviderOnboardingFinish from "./steps/ProviderOnboardingFinish";

const ProviderOnboardingPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      t("onboarding_profile"),
      t("onboarding_services"),
      t("onboarding_schedule"),
      t("onboarding_finish"),
    ],
    [t]
  );

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // ✅🔥 REAL FIX IS HERE
  const finishOnboarding = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      });

      // ✅ NOW navigation will stick
      navigate("/provider/dashboard", { replace: true });
    } catch (err) {
      console.error("Onboarding completion failed:", err);
      alert("Failed to complete onboarding");
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("onboarding_title")}</title>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-3xl bg-white border rounded-xl p-6">
          {/* Stepper */}
          <div className="flex items-center mb-6">
            {steps.map((label, index) => (
              <div key={index} className="flex-1 px-1">
                <div
                  className={`h-2 rounded-full ${
                    index <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
                <p
                  className={`text-xs mt-2 text-center ${
                    index === step
                      ? "font-semibold text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {step === 0 && <ProviderOnboardingProfile onNext={next} />}
          {step === 1 && (
            <ProviderOnboardingServices onNext={next} onBack={back} />
          )}
          {step === 2 && (
            <ProviderOnboardingSchedule onNext={next} onBack={back} />
          )}
          {step === 3 && (
            <ProviderOnboardingFinish onFinish={finishOnboarding} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProviderOnboardingPage;

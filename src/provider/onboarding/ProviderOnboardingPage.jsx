import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import providerApi from "@/services/providerApi";

/* ================= STEPS ================= */
import ProviderOnboardingProfile from "./steps/ProviderOnboardingProfile";
import ProviderOnboardingIdentity from "./steps/ProviderOnboardingIdentity";
import ProviderOnboardingAddress from "./steps/ProviderOnboardingAddress";
import ProviderOnboardingWork from "./steps/ProviderOnboardingWork";
import ProviderOnboardingBank from "./steps/ProviderOnboardingBank";
import ProviderOnboardingFinish from "./steps/ProviderOnboardingFinish";

const ProviderOnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { t, i18n } = useTranslation();
  const { setProviderOnboardingCompleted, setProviderStatus } = useAuth();

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  /* ================= STEPPER ================= */
  const getStepFromQuery = () => {
    const raw = Number(searchParams.get("step"));
    if (Number.isNaN(raw)) return 0;
    return Math.min(Math.max(raw, 0), 5);
  };

  const [step, setStep] = useState(getStepFromQuery());
  const [prefill, setPrefill] = useState(null);
  const editMode = searchParams.has("step");

  const steps = useMemo(
    () => [
      t("profile"),
      t("identity"),
      t("address"),
      t("work"),
      t("bank"),
      t("submit"),
    ],
    [t]
  );

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  useEffect(() => {
    setStep(getStepFromQuery());
  }, [searchParams]);

  useEffect(() => {
    const loadPrefill = async () => {
      try {
        const res = await providerApi.get("/provider/onboarding/status");
        setPrefill(res.data?.data || null);
      } catch (err) {
        console.error("Failed to load onboarding prefill:", err);
      }
    };
    loadPrefill();
  }, []);

  const handleStepSaved = async () => {
    if (!editMode) {
      next();
      return;
    }
    try {
      const res = await providerApi.get("/provider/onboarding/status");
      setPrefill(res.data?.data || null);
    } catch (err) {
      console.error("Failed to refresh onboarding prefill:", err);
    }
  };

  /* ================= FINISH (BACKEND ONLY) ================= */
  const finishOnboarding = async () => {
    try {
      await providerApi.post("/provider/onboarding/complete");
      sessionStorage.setItem("provider_onboarding_completed", "true");
      sessionStorage.setItem("provider_status", "PENDING");
      setProviderOnboardingCompleted(true);
      setProviderStatus("PENDING");

      navigate("/provider/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error("Onboarding completion failed:", err);
      alert(t("failed_submit_onboarding"));
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("provider_onboarding")}</title>
      </Helmet>

      <div className="bg-background px-2 sm:px-4">
        <div className="w-full max-w-4xl mx-auto bg-white border rounded-xl p-6">
          {location.state?.fromRegistration && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {t("registration_success_complete_onboarding")}
            </div>
          )}

          {/* ================= STEPPER UI ================= */}
          <div className="flex items-center mb-8">
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

          {/* ================= STEPS ================= */}
          {step === 0 && (
            <ProviderOnboardingProfile
              onNext={handleStepSaved}
              stayOnSave={editMode}
              initialData={{
                profile: prefill?.profile,
                section: prefill?.sections?.find((s) => s.key === "profile"),
              }}
            />
          )}

          {step === 1 && (
            <ProviderOnboardingIdentity
              onNext={handleStepSaved}
              onBack={back}
              stayOnSave={editMode}
              initialData={prefill?.sections?.find((s) => s.key === "identity")}
            />
          )}

          {step === 2 && (
            <ProviderOnboardingAddress
              onNext={handleStepSaved}
              onBack={back}
              stayOnSave={editMode}
              initialData={prefill?.sections?.find((s) => s.key === "address")}
            />
          )}

          {step === 3 && (
            <ProviderOnboardingWork
              onNext={handleStepSaved}
              onBack={back}
              stayOnSave={editMode}
              initialData={prefill?.sections?.find((s) => s.key === "work")}
            />
          )}

          {step === 4 && (
            <ProviderOnboardingBank
              onNext={handleStepSaved}
              onBack={back}
              stayOnSave={editMode}
              initialData={prefill?.sections?.find((s) => s.key === "bank")}
            />
          )}

          {step === 5 && (
            <ProviderOnboardingFinish onFinish={finishOnboarding} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProviderOnboardingPage;

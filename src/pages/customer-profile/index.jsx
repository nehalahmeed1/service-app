import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/AppIcon";

const DEFAULT_PROFILE = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  preferredLanguage: "English",
};

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("customer_profile");
      const parsed = saved ? JSON.parse(saved) : {};
      setProfile({
        ...DEFAULT_PROFILE,
        ...parsed,
        fullName:
          parsed?.fullName || user?.displayName || (user?.email ? user.email.split("@")[0] : ""),
        email: parsed?.email || user?.email || "",
      });
    } catch (error) {
      console.error("Failed to load customer profile", error);
      setProfile({
        ...DEFAULT_PROFILE,
        fullName: user?.displayName || "",
        email: user?.email || "",
      });
    }
  }, [user]);

  const completion = useMemo(() => {
    const keys = ["fullName", "phone", "email", "city", "address"];
    const filled = keys.filter((k) => Boolean(profile[k]?.trim())).length;
    return Math.round((filled / keys.length) * 100);
  }, [profile]);

  return (
    <>
      <Helmet>
        <title>{t("my_profile", { defaultValue: "My Profile" })}</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-5">
        <section className="rounded-2xl border bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Icon name="ShieldCheck" size={14} />
                {t("secure_account", { defaultValue: "Secure Account" })}
              </p>
              <h1 className="mt-3 text-2xl font-bold text-slate-900">
                {t("my_profile", { defaultValue: "My Profile" })}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {t("customer_profile_subtitle", {
                  defaultValue: "Manage contact details, location, and preferences.",
                })}
              </p>
            </div>

            <button
              onClick={() => navigate("/customer/profile/edit")}
              className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
            >
              {t("edit_profile", { defaultValue: "Edit Profile" })}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <section className="xl:col-span-2 rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("profile_information", { defaultValue: "Profile Information" })}
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Info label={t("full_name", { defaultValue: "Full Name" })} value={profile.fullName} />
              <Info label={t("phone_number", { defaultValue: "Phone Number" })} value={profile.phone} />
              <Info label={t("email", { defaultValue: "Email" })} value={profile.email} />
              <Info label={t("city", { defaultValue: "City" })} value={profile.city} />
              <Info label={t("address", { defaultValue: "Address" })} value={profile.address} />
              <Info
                label={t("preferred_language", { defaultValue: "Preferred Language" })}
                value={profile.preferredLanguage}
              />
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border bg-white p-5">
              <h3 className="font-semibold text-slate-900">
                {t("profile_completeness", { defaultValue: "Profile Completeness" })}
              </h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">{completion}%</p>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.max(8, completion)}%` }}
                />
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h3 className="font-semibold text-slate-900">
                {t("quick_actions", { defaultValue: "Quick Actions" })}
              </h3>
              <div className="mt-3 space-y-2">
                <ActionBtn
                  label={t("find_service_providers", { defaultValue: "Find Services" })}
                  onClick={() => navigate("/customer/home")}
                />
                <ActionBtn
                  label={t("edit_profile", { defaultValue: "Edit Profile" })}
                  onClick={() => navigate("/customer/profile/edit")}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-900 mt-1">{value || "-"}</p>
    </div>
  );
}

function ActionBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

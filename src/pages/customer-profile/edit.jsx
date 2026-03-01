import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/AppIcon";

const DEFAULT_FORM = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  preferredLanguage: "English",
};

export default function EditCustomerProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("customer_profile");
      const parsed = raw ? JSON.parse(raw) : {};
      setForm({
        ...DEFAULT_FORM,
        ...parsed,
        fullName:
          parsed?.fullName || user?.displayName || (user?.email ? user.email.split("@")[0] : ""),
        email: parsed?.email || user?.email || "",
      });
    } catch (error) {
      console.error("Failed to load edit profile", error);
      setForm({
        ...DEFAULT_FORM,
        fullName: user?.displayName || "",
        email: user?.email || "",
      });
    }
  }, [user]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim()) {
      alert(
        t("fill_required_profile_fields", {
          defaultValue: "Please fill Full Name, Phone Number, and Email.",
        })
      );
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem("customer_profile", JSON.stringify(form));
      navigate("/customer/profile", { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("edit_profile", { defaultValue: "Edit Profile" })}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-5">
        <section className="rounded-2xl border bg-white p-5">
          <button
            onClick={() => navigate("/customer/profile")}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <Icon name="ArrowLeft" size={14} />
            {t("back", { defaultValue: "Back" })}
          </button>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {t("edit_profile", { defaultValue: "Edit Profile" })}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("edit_customer_profile_subtitle", {
              defaultValue: "Keep your details up to date for faster booking and communication.",
            })}
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={t("full_name", { defaultValue: "Full Name" })}
              value={form.fullName}
              onChange={(v) => onChange("fullName", v)}
            />
            <Field
              label={t("phone_number", { defaultValue: "Phone Number" })}
              value={form.phone}
              onChange={(v) => onChange("phone", v)}
            />
            <Field
              label={t("email", { defaultValue: "Email" })}
              value={form.email}
              onChange={(v) => onChange("email", v)}
            />
            <Field
              label={t("city", { defaultValue: "City" })}
              value={form.city}
              onChange={(v) => onChange("city", v)}
            />
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500">
                {t("address", { defaultValue: "Address" })}
              </label>
              <textarea
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
                className="mt-1 h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">
                {t("preferred_language", { defaultValue: "Preferred Language" })}
              </label>
              <select
                value={form.preferredLanguage}
                onChange={(e) => onChange("preferredLanguage", e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Telugu</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:opacity-70"
            >
              {saving
                ? t("saving", { defaultValue: "Saving..." })
                : t("save", { defaultValue: "Save" })}
            </button>
            <button
              onClick={() => navigate("/customer/profile")}
              className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-medium text-slate-700"
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

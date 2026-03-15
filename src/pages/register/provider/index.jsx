import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import axios from "axios";
import Icon from "@/components/AppIcon";
import LanguageSwitcher from "@/components/LanguageSwitcher";

import { auth } from "@/firebase";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProviderRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "Mancherial",
    password: "",
    confirmPassword: "",
  });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 3 &&
      form.email.trim().length > 0 &&
      form.phone.trim().length >= 10 &&
      form.password.length >= 6 &&
      form.confirmPassword.length >= 6
    );
  }, [form]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    setError("");

    if (!canSubmit) {
      setError(t("fill_required_fields_correctly"));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t("password_confirm_mismatch") || "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await setPersistence(auth, browserSessionPersistence);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      const uid = userCredential.user.uid;

      await axios.post(`${API_BASE_URL}/auth/provider/register`, {
        firebaseUid: uid,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        service: "",
      });

      navigate("/provider/onboarding", {
        replace: true,
        state: { fromRegistration: true },
      });
    } catch (err) {
      console.error("Provider register error:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("registration_failed") ||
        "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">
            {t("provider_register_title")}
          </h1>
          <LanguageSwitcher />
        </div>

        <p className="mb-5 text-sm text-slate-600">
          {t("provider_register_subtitle")}
        </p>

        <div className="space-y-3">
          <Input
            placeholder={t("fullName") || "Full Name"}
            value={form.name}
            onChange={(v) => onChange("name", v)}
          />
          <Input
            type="email"
            placeholder={t("email") || "Email"}
            value={form.email}
            onChange={(v) => onChange("email", v)}
          />
          <Input
            placeholder={t("mobile") || "Mobile"}
            value={form.phone}
            onChange={(v) => onChange("phone", v.replace(/[^\d]/g, "").slice(0, 10))}
          />
          <Input
            placeholder={t("serviceArea") || "Service Area"}
            value={form.location}
            onChange={(v) => onChange("location", v)}
          />

          <PasswordInput
            placeholder={t("password") || "Password"}
            value={form.password}
            visible={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
            onChange={(v) => onChange("password", v)}
          />

          <PasswordInput
            placeholder={t("confirm_password") || "Confirm Password"}
            value={form.confirmPassword}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((prev) => !prev)}
            onChange={(v) => onChange("confirmPassword", v)}
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className="mt-5 h-11 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
        >
          {loading ? (t("registering") || "Registering...") : (t("register") || "Register")}
        </button>

        <div className="mt-4 flex items-center text-sm">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => navigate("/provider/login")}
          >
            {t("back") || "Back"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-primary"
    />
  );
}

function PasswordInput({ value, onChange, placeholder, visible, onToggle }) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-slate-300 px-3 pr-10 text-sm outline-none transition focus:border-primary"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
      >
        <Icon name={visible ? "EyeOff" : "Eye"} size={16} />
      </button>
    </div>
  );
}

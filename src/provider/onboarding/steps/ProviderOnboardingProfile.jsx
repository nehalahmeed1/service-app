import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import providerApi from "@/services/providerApi";

const API_BASE = "http://localhost:5000";

export default function ProviderOnboardingProfile({ onNext, initialData }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    profilePhoto: null,
    preview: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const profile = initialData?.profile || {};
    const section = initialData?.section?.data || {};
    const existingDoc = section?.documents?.[0] || profile?.avatar || "";

    setForm((prev) => ({
      ...prev,
      fullName: profile?.name || section?.fullName || prev.fullName,
      phone: profile?.phone || section?.phone || prev.phone,
      preview: existingDoc
        ? existingDoc.startsWith("http")
          ? existingDoc
          : `${API_BASE}${existingDoc}`
        : prev.preview,
    }));
  }, [initialData]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      profilePhoto: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleNext = async () => {
    if (!form.fullName || !form.phone || (!form.profilePhoto && !form.preview)) {
      alert("Please complete all required fields");
      return;
    }

    if (!form.profilePhoto && form.preview) {
      onNext();
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("phone", form.phone);
      formData.append("profilePhoto", form.profilePhoto);

      await providerApi.post("/provider/onboarding/profile", formData);
      onNext();
    } catch (error) {
      console.error(error);
      alert("Failed to upload profile details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("profile_setup")}</h2>
        <p className="text-muted-foreground mt-1">{t("profile_setup_subtitle")}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-full border overflow-hidden bg-gray-100 flex items-center justify-center">
          {form.preview ? (
            <img
              src={form.preview}
              alt="Profile Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500 text-center">Profile Photo</span>
          )}
        </div>

        <label className="cursor-pointer text-sm text-primary font-medium">
          Upload Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder={t("fullName")}
          className="w-full border border-input rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder={t("phoneNumber")}
          className="w-full border border-input rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          disabled={loading}
          onClick={handleNext}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          {loading ? "Uploading..." : t("next")}
        </button>
      </div>
    </div>
  );
}

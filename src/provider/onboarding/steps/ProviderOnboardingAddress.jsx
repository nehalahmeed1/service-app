import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/services/providerApi";

const API_BASE = "http://localhost:5000";

export default function ProviderOnboardingAddress({
  onNext,
  onBack,
  initialData,
  stayOnSave = false,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    addressProof: null,
    preview: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const section = initialData?.data || {};
    const doc = Array.isArray(section.documents) ? section.documents[0] : null;

    setForm((prev) => ({
      ...prev,
      addressLine: section.addressLine || prev.addressLine,
      city: section.city || prev.city,
      state: section.state || prev.state,
      pincode: section.pincode || prev.pincode,
      preview: doc
        ? doc.startsWith("http")
          ? doc
          : `${API_BASE}${doc}`
        : prev.preview,
    }));
  }, [initialData]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      addressProof: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleNext = async () => {
    const { addressLine, city, state, pincode, addressProof } = form;

    if (!addressLine || !city || !state || !pincode || (!addressProof && !form.preview)) {
      alert(t("please_complete_address_verification"));
      return;
    }

    if (!addressProof && form.preview) {
      onNext();
      if (stayOnSave) {
        alert(t("saved"));
      }
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("addressLine", addressLine);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("pincode", pincode);
      formData.append("addressProof", addressProof);

      // ✅ DO NOT set Content-Type manually
      await api.post("/provider/onboarding/address", formData);

      onNext();
      if (stayOnSave) {
        alert(t("saved"));
      }
    } catch (error) {
      console.error(error);
      alert(t("failed_upload_address_details"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("address_verification")}</h2>
        <p className="text-muted-foreground mt-1">
          {t("address_verification_subtitle")}
        </p>
      </div>

      <input
        name="addressLine"
        value={form.addressLine}
        onChange={handleChange}
        placeholder={t("address_line")}
        className="w-full border rounded-lg px-4 py-2"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder={t("city")}
          className="border rounded-lg px-4 py-2"
        />
        <input
          name="state"
          value={form.state}
          onChange={handleChange}
          placeholder={t("state")}
          className="border rounded-lg px-4 py-2"
        />
        <input
          name="pincode"
          value={form.pincode}
          onChange={handleChange}
          placeholder={t("pincode")}
          maxLength={6}
          className="border rounded-lg px-4 py-2"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">
          {t("address_proof")}
        </p>

        <div className="border rounded-lg p-3 h-40 flex items-center justify-center bg-gray-50">
          {form.preview ? (
            <img
              src={form.preview}
              alt={t("address_proof")}
              className="h-full object-contain"
            />
          ) : (
            <span className="text-xs text-gray-500">
              {t("upload_address_proof_image")}
            </span>
          )}
        </div>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
        />
      </div>

      <div className={`flex ${stayOnSave ? "justify-end" : "justify-between"}`}>
        {!stayOnSave && (
          <button onClick={onBack} className="px-6 py-2 rounded-lg border">
            {t("back")}
          </button>
        )}

        <button
          disabled={loading}
          onClick={handleNext}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          {loading ? t("saving") : stayOnSave ? t("save") : t("next")}
        </button>
      </div>
    </div>
  );
}

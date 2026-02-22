import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import providerApi from "@/services/providerApi";

const API_BASE = "http://localhost:5000";

export default function ProviderOnboardingIdentity({ onNext, onBack, initialData }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    aadhaarNumber: "",
    aadhaarFront: null,
    aadhaarBack: null,
    previewFront: null,
    previewBack: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const section = initialData?.data || {};
    const docs = Array.isArray(section.documents) ? section.documents : [];

    setForm((prev) => ({
      ...prev,
      aadhaarNumber: section.aadhaarNumber || prev.aadhaarNumber,
      previewFront: docs[0]
        ? docs[0].startsWith("http")
          ? docs[0]
          : `${API_BASE}${docs[0]}`
        : prev.previewFront,
      previewBack: docs[1]
        ? docs[1].startsWith("http")
          ? docs[1]
          : `${API_BASE}${docs[1]}`
        : prev.previewBack,
    }));
  }, [initialData]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      [type]: file,
      [`preview${type === "aadhaarFront" ? "Front" : "Back"}`]:
        URL.createObjectURL(file),
    }));
  };

  const handleNext = async () => {
    if (
      !form.aadhaarNumber ||
      (!form.aadhaarFront && !form.previewFront) ||
      (!form.aadhaarBack && !form.previewBack)
    ) {
      alert("Please complete identity verification details");
      return;
    }

    if (!form.aadhaarFront && !form.aadhaarBack && form.previewFront && form.previewBack) {
      onNext();
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("aadhaarNumber", form.aadhaarNumber);
      formData.append("aadhaarFront", form.aadhaarFront);
      formData.append("aadhaarBack", form.aadhaarBack);

      // ✅ IMPORTANT:
      // DO NOT set Content-Type manually
      await providerApi.post(
        "/provider/onboarding/identity",
        formData
      );

      onNext();
    } catch (err) {
      console.error(err);
      alert("Failed to upload identity documents");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Identity Verification
        </h2>
        <p className="text-muted-foreground mt-1">
          Upload your government ID details for verification
        </p>
      </div>

      <input
        name="aadhaarNumber"
        value={form.aadhaarNumber}
        onChange={handleChange}
        placeholder="Aadhaar Number"
        maxLength={12}
        className="w-full border border-input rounded-lg px-4 py-2"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aadhaar Front */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Aadhaar Front</p>
          <div className="border rounded-lg p-3 h-40 flex items-center justify-center bg-gray-50">
            {form.previewFront ? (
              <img
                src={form.previewFront}
                alt="Aadhaar Front"
                className="h-full object-contain"
              />
            ) : (
              <span className="text-xs text-gray-500">
                Upload front side
              </span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "aadhaarFront")}
          />
        </div>

        {/* Aadhaar Back */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Aadhaar Back</p>
          <div className="border rounded-lg p-3 h-40 flex items-center justify-center bg-gray-50">
            {form.previewBack ? (
              <img
                src={form.previewBack}
                alt="Aadhaar Back"
                className="h-full object-contain"
              />
            ) : (
              <span className="text-xs text-gray-500">
                Upload back side
              </span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "aadhaarBack")}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg border"
        >
          Back
        </button>

        <button
          disabled={loading}
          onClick={handleNext}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Uploading..." : "Next"}
        </button>
      </div>
    </div>
  );
}

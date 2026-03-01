import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import providerApi from "@/services/providerApi";

const API_BASE = "http://localhost:5000";

export default function ProviderOnboardingBank({
  onNext,
  onBack,
  initialData,
  stayOnSave = false,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankProof: null,
    preview: null,
  });
  const [loading, setLoading] = useState(false);
  const [existingDocName, setExistingDocName] = useState("");

  useEffect(() => {
    const section = initialData?.data || {};
    const doc = Array.isArray(section.documents) ? section.documents[0] : null;
    const docName = doc ? String(doc).split("/").pop() : "";
    setForm((prev) => ({
      ...prev,
      accountHolderName: section.accountHolderName || prev.accountHolderName,
      accountNumber: section.accountNumber || prev.accountNumber,
      ifscCode: section.ifscCode || prev.ifscCode,
      preview: doc
        ? doc.startsWith("http")
          ? doc
          : `${API_BASE}${doc}`
        : prev.preview,
    }));
    setExistingDocName(docName || "");
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
      bankProof: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleNext = async () => {
    const { accountHolderName, accountNumber, ifscCode, bankProof } = form;

    if (!accountHolderName || !accountNumber || !ifscCode || (!bankProof && !form.preview)) {
      alert(t("please_complete_bank_verification"));
      return;
    }

    if (!bankProof && form.preview) {
      onNext();
      if (stayOnSave) {
        alert(t("saved"));
      }
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("accountHolderName", accountHolderName);
      formData.append("accountNumber", accountNumber);
      formData.append("ifscCode", ifscCode);
      formData.append("bankProof", bankProof);

      await providerApi.post("/provider/onboarding/bank", formData);
      onNext();
      if (stayOnSave) {
        alert(t("saved"));
      }
    } catch (error) {
      console.error(error);
      alert(t("failed_upload_bank_details"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("bank_verification")}</h2>
        <p className="text-muted-foreground mt-1">
          {t("bank_verification_subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="accountHolderName"
          value={form.accountHolderName}
          onChange={handleChange}
          placeholder={t("account_holder_name")}
          className="border rounded-lg px-4 py-2"
        />

        <input
          name="accountNumber"
          value={form.accountNumber}
          onChange={handleChange}
          placeholder={t("account_number")}
          className="border rounded-lg px-4 py-2"
        />

        <input
          name="ifscCode"
          value={form.ifscCode}
          onChange={handleChange}
          placeholder={t("ifsc_code")}
          className="border rounded-lg px-4 py-2"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">
          {t("bank_proof")}
        </p>

        <div className="border rounded-lg p-3 h-40 flex items-center justify-center bg-gray-50">
          {form.preview ? (
            <img
              src={form.preview}
              alt={t("bank_proof")}
              className="h-full object-contain"
            />
          ) : (
            <span className="text-xs text-gray-500">
              {t("upload_bank_proof_image")}
            </span>
          )}
        </div>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
        />

        <p className="text-xs text-muted-foreground">
          {form.bankProof?.name
            ? `Selected file: ${form.bankProof.name}`
            : existingDocName
            ? `Uploaded file: ${existingDocName}`
            : "No file selected yet"}
        </p>
      </div>

      <div className={`flex ${stayOnSave ? "justify-end" : "justify-between"}`}>
        {!stayOnSave && (
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-lg border"
          >
            {t("back")}
          </button>
        )}

        <button
          disabled={loading}
          onClick={handleNext}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90"
        >
          {loading ? t("saving") : stayOnSave ? t("save") : t("next")}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import providerApi from "@/services/providerApi";

const API_BASE = "http://localhost:5000";

export default function ProviderOnboardingBank({ onNext, onBack, initialData }) {
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankProof: null,
    preview: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const section = initialData?.data || {};
    const doc = Array.isArray(section.documents) ? section.documents[0] : null;
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
      alert("Please complete bank verification details");
      return;
    }

    if (!bankProof && form.preview) {
      onNext();
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
    } catch (error) {
      console.error(error);
      alert("Failed to upload bank verification details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Bank Verification</h2>
        <p className="text-muted-foreground mt-1">
          Add your bank details for payouts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="accountHolderName"
          value={form.accountHolderName}
          onChange={handleChange}
          placeholder="Account Holder Name"
          className="border rounded-lg px-4 py-2"
        />

        <input
          name="accountNumber"
          value={form.accountNumber}
          onChange={handleChange}
          placeholder="Account Number"
          className="border rounded-lg px-4 py-2"
        />

        <input
          name="ifscCode"
          value={form.ifscCode}
          onChange={handleChange}
          placeholder="IFSC Code"
          className="border rounded-lg px-4 py-2"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">
          Bank Proof (Cancelled Cheque / Passbook)
        </p>

        <div className="border rounded-lg p-3 h-40 flex items-center justify-center bg-gray-50">
          {form.preview ? (
            <img
              src={form.preview}
              alt="Bank Proof"
              className="h-full object-contain"
            />
          ) : (
            <span className="text-xs text-gray-500">
              Upload bank proof image
            </span>
          )}
        </div>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
        />
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
          className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90"
        >
          {loading ? "Uploading..." : "Next"}
        </button>
      </div>
    </div>
  );
}

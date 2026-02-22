import { useEffect, useMemo, useState } from "react";
import { fetchPublicCategories } from "@/services/categoryService";
import providerApi from "@/services/providerApi";

const API_BASE = "http://localhost:5000";

export default function ProviderOnboardingWork({ onNext, onBack, initialData }) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    experienceYears: "",
    workImages: [],
    certificate: null,
  });
  const [existingDocs, setExistingDocs] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchPublicCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const section = initialData?.data || {};
    const docs = Array.isArray(section.documents) ? section.documents : [];

    setForm((prev) => ({
      ...prev,
      categoryId: section.categoryId || prev.categoryId,
      experienceYears:
        section.experienceYears !== undefined
          ? String(section.experienceYears)
          : prev.experienceYears,
    }));

    setExistingDocs(
      docs.map((doc) => (doc.startsWith("http") ? doc : `${API_BASE}${doc}`))
    );
  }, [initialData]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "workImages") {
      setForm((prev) => ({ ...prev, workImages: [...files] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const workImagePreviews = useMemo(
    () =>
      form.workImages.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [form.workImages]
  );

  const certificatePreview = useMemo(
    () =>
      form.certificate
        ? {
            name: form.certificate.name,
            url: URL.createObjectURL(form.certificate),
          }
        : null,
    [form.certificate]
  );

  useEffect(() => {
    return () => {
      workImagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
      if (certificatePreview) {
        URL.revokeObjectURL(certificatePreview.url);
      }
    };
  }, [workImagePreviews, certificatePreview]);

  const canProceed =
    !loadingCategories &&
    form.categoryId &&
    form.experienceYears &&
    (form.workImages.length > 0 || existingDocs.length > 0);

  const handleNext = async () => {
    if (!canProceed) return;

    if (form.workImages.length === 0 && existingDocs.length > 0) {
      onNext();
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("categoryId", form.categoryId);
      formData.append("experienceYears", form.experienceYears);
      form.workImages.forEach((file) =>
        formData.append("workImages", file)
      );
      if (form.certificate) {
        formData.append("certificate", form.certificate);
      }

      await providerApi.post("/provider/onboarding/work", formData);
      onNext();
    } catch (err) {
      console.error(err);
      alert("Failed to upload work verification details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Work Verification</h2>
        <p className="text-muted-foreground">
          Upload your work samples and experience details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Service Category
          </label>

          <select
            value={form.categoryId}
            disabled={loadingCategories || loading}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                categoryId: e.target.value,
              }))
            }
            className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
          >
            <option value="">
              {loadingCategories ? "Loading categories..." : "Select category"}
            </option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {!loadingCategories && categories.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              No active categories available
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            value={form.experienceYears}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                experienceYears: e.target.value,
              }))
            }
            className="w-full border rounded-lg px-4 py-2"
            placeholder="e.g. 3"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Work Images (Upload multiple)
        </label>
        <input
          type="file"
          name="workImages"
          multiple
          onChange={handleFileChange}
        />
        {form.workImages.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            At least one image is required
          </p>
        )}
        {workImagePreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {workImagePreviews.map((item) => (
              <img
                key={item.url}
                src={item.url}
                alt={item.name}
                className="h-24 w-full object-cover border rounded"
              />
            ))}
          </div>
        )}
        {workImagePreviews.length === 0 && existingDocs.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {existingDocs.map((url) => (
              <img
                key={url}
                src={url}
                alt="Existing Work"
                className="h-24 w-full object-cover border rounded"
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Certificate (Optional)
        </label>
        <input
          type="file"
          name="certificate"
          onChange={handleFileChange}
        />
        {certificatePreview && (
          <div className="mt-3">
            <img
              src={certificatePreview.url}
              alt={certificatePreview.name}
              className="h-28 w-40 object-cover border rounded"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg border"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed || loading}
          className={`px-6 py-2 rounded-lg text-white ${
            canProceed && !loading
              ? "bg-primary hover:opacity-90"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Uploading..." : "Next"}
        </button>
      </div>
    </div>
  );
}

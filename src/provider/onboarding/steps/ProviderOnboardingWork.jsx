import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchPublicCategories,
  fetchPublicSubCategories,
} from "@/services/categoryService";
import providerApi from "@/services/providerApi";

const API_BASE = "http://localhost:5000";

export default function ProviderOnboardingWork({
  onNext,
  onBack,
  initialData,
  stayOnSave = false,
}) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    subCategoryId: "",
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
      subCategoryId: section.subCategoryId || prev.subCategoryId,
      experienceYears:
        section.experienceYears !== undefined
          ? String(section.experienceYears)
          : prev.experienceYears,
    }));

    setExistingDocs(
      docs.map((doc) => (doc.startsWith("http") ? doc : `${API_BASE}${doc}`))
    );
  }, [initialData]);

  useEffect(() => {
    const loadSubCategories = async () => {
      if (!form.categoryId) {
        setSubCategories([]);
        return;
      }

      try {
        setLoadingSubCategories(true);
        const data = await fetchPublicSubCategories({
          categoryId: form.categoryId,
        });
        setSubCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load sub-categories", err);
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    };

    loadSubCategories();
  }, [form.categoryId]);

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
    (subCategories.length === 0 || form.subCategoryId) &&
    form.experienceYears &&
    (form.workImages.length > 0 || existingDocs.length > 0);

  const handleNext = async () => {
    if (!canProceed) return;

    if (form.workImages.length === 0 && existingDocs.length > 0) {
      onNext();
      if (stayOnSave) {
        alert(t("saved"));
      }
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("categoryId", form.categoryId);
      if (form.subCategoryId) {
        formData.append("subCategoryId", form.subCategoryId);
      }
      formData.append("experienceYears", form.experienceYears);
      form.workImages.forEach((file) =>
        formData.append("workImages", file)
      );
      if (form.certificate) {
        formData.append("certificate", form.certificate);
      }

      await providerApi.post("/provider/onboarding/work", formData);
      onNext();
      if (stayOnSave) {
        alert(t("saved"));
      }
    } catch (err) {
      console.error(err);
      alert(t("failed_upload_work_details"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("work_verification")}</h2>
        <p className="text-muted-foreground">
          {t("work_verification_subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("service_category")}
          </label>

          <select
            value={form.categoryId}
            disabled={loadingCategories || loading}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                categoryId: e.target.value,
                subCategoryId: "",
              }))
            }
            className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
          >
            <option value="">
              {loadingCategories ? t("loading_categories") : t("select_category")}
            </option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {!loadingCategories && categories.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              {t("no_active_categories")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Sub-category
          </label>

          <select
            value={form.subCategoryId}
            disabled={!form.categoryId || loadingSubCategories || loading}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                subCategoryId: e.target.value,
              }))
            }
            className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
          >
            <option value="">
              {loadingSubCategories
                ? "Loading sub-categories..."
                : "Select sub-category"}
            </option>

            {subCategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("years_of_experience")}
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
            placeholder={t("example_3")}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("work_images_upload_multiple")}
        </label>
        <input
          type="file"
          name="workImages"
          multiple
          onChange={handleFileChange}
        />
        {form.workImages.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {t("at_least_one_image_required")}
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
                alt={t("existing_work")}
                className="h-24 w-full object-cover border rounded"
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("certificate_optional")}
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

      <div className={`flex pt-4 ${stayOnSave ? "justify-end" : "justify-between"}`}>
        {!stayOnSave && (
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-lg border"
          >
            {t("back")}
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={!canProceed || loading}
          className={`px-6 py-2 rounded-lg text-white ${
            canProceed && !loading
              ? "bg-primary hover:opacity-90"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? t("saving") : stayOnSave ? t("save") : t("next")}
        </button>
      </div>
    </div>
  );
}

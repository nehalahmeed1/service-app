import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import providerApi from "@/services/providerApi";
import { useAuth } from "@/context/AuthContext";
import {
  fetchPublicCategories,
  fetchPublicSubCategories,
} from "@/services/categoryService";

const API_BASE = "http://localhost:5000";

export default function EditProviderProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setProviderProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    serviceCategoryId: "",
    serviceSubCategoryId: "",
    location: "",
    bio: "",
    yearsExperience: 0,
    profilePhoto: null,
    preview: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileRes, categoriesData] = await Promise.all([
          providerApi.get("/provider/me"),
          fetchPublicCategories(),
        ]);

        const p = profileRes.data?.data;
        const categoryList = Array.isArray(categoriesData) ? categoriesData : [];
        setCategories(categoryList);

        const categoryId = p?.serviceCategoryId || "";
        let selectedSubCategories = [];

        if (categoryId) {
          selectedSubCategories = await fetchPublicSubCategories({ categoryId });
        }

        setSubCategories(Array.isArray(selectedSubCategories) ? selectedSubCategories : []);
        setForm((prev) => ({
          ...prev,
          name: p?.name || "",
          phone: p?.phone || "",
          serviceCategoryId: categoryId,
          serviceSubCategoryId: p?.serviceSubCategoryId || "",
          location: p?.location || "",
          bio: p?.bio || "",
          yearsExperience: p?.yearsExperience || 0,
          preview: p?.avatar
            ? p.avatar.startsWith("http")
              ? p.avatar
              : `${API_BASE}${p.avatar}`
            : "",
        }));
      } catch (err) {
        console.error(err);
        setError(t("failed_load_profile"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadSubCategories = async () => {
      if (!form.serviceCategoryId) {
        setSubCategories([]);
        return;
      }

      try {
        setLoadingSubCategories(true);
        const data = await fetchPublicSubCategories({
          categoryId: form.serviceCategoryId,
        });
        setSubCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    };

    loadSubCategories();
  }, [form.serviceCategoryId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("serviceCategoryId", form.serviceCategoryId || "");
      formData.append("serviceSubCategoryId", form.serviceSubCategoryId || "");
      formData.append("location", form.location);
      formData.append("bio", form.bio);
      formData.append("yearsExperience", String(form.yearsExperience || 0));
      if (form.profilePhoto) {
        formData.append("profilePhoto", form.profilePhoto);
      }

      const response = await providerApi.put("/provider/me", formData);
      const updatedProfile = response?.data?.data || null;
      if (updatedProfile) {
        setProviderProfile(updatedProfile);
      }
      navigate("/provider/profile", { replace: true });
    } catch (err) {
      console.error(err);
      setError(t("failed_update_profile"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm">{t("loading_edit_form")}</p>;

  return (
    <>
      <Helmet>
        <title>{t("edit_provider_profile")}</title>
      </Helmet>

      <main className="max-w-3xl space-y-5">
        <section className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">{t("edit_provider_profile")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("edit_provider_profile_subtitle")}
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-6 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-4">
            {form.preview ? (
              <img
                src={form.preview}
                alt={t("profile_preview")}
                className="h-16 w-16 rounded-full border object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10" />
            )}

            <label className="text-sm cursor-pointer text-primary font-medium">
              {t("change_photo")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setForm((prev) => ({
                    ...prev,
                    profilePhoto: file,
                    preview: URL.createObjectURL(file),
                  }));
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label={t("fullName")}
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <InputField
              label={t("phoneNumber")}
              value={form.phone}
              onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
            />

            <SelectField
              label="Category"
              value={form.serviceCategoryId}
              onChange={(value) =>
                setForm((p) => ({
                  ...p,
                  serviceCategoryId: value,
                  serviceSubCategoryId: "",
                }))
              }
              options={categories.map((cat) => ({
                value: cat._id,
                label: cat.name,
              }))}
              placeholder="Select category"
            />

            <SelectField
              label="Sub-category"
              value={form.serviceSubCategoryId}
              onChange={(value) =>
                setForm((p) => ({ ...p, serviceSubCategoryId: value }))
              }
              options={subCategories.map((sub) => ({
                value: sub._id,
                label: sub.name,
              }))}
              placeholder={
                loadingSubCategories ? "Loading sub-categories..." : "Select sub-category"
              }
              disabled={!form.serviceCategoryId || loadingSubCategories}
            />

            <InputField
              label={t("location")}
              value={form.location}
              onChange={(v) => setForm((p) => ({ ...p, location: v }))}
            />
            <InputField
              label={t("years_of_experience")}
              type="number"
              value={form.yearsExperience}
              onChange={(v) =>
                setForm((p) => ({ ...p, yearsExperience: Number(v || 0) }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("bio")}</label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="mt-1 w-full border rounded-md px-3 py-2"
              placeholder={t("provider_bio_placeholder")}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-4 rounded-md bg-primary text-white hover:opacity-90"
            >
              {saving ? t("saving") : t("save_changes")}
            </button>
            <button
              onClick={() => navigate("/provider/profile")}
              className="h-10 px-4 rounded-md border"
            >
              {t("cancel")}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full border rounded-md px-3"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 h-10 w-full border rounded-md px-3 bg-white disabled:bg-gray-100"
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

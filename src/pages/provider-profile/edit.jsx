import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import providerApi from "@/services/providerApi";

const API_BASE = "http://localhost:5000";

export default function EditProviderProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
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
        const res = await providerApi.get("/provider/me");
        const p = res.data?.data;
        setForm((prev) => ({
          ...prev,
          name: p?.name || "",
          phone: p?.phone || "",
          service: p?.service || "",
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
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("service", form.service);
      formData.append("location", form.location);
      formData.append("bio", form.bio);
      formData.append("yearsExperience", String(form.yearsExperience || 0));
      if (form.profilePhoto) {
        formData.append("profilePhoto", form.profilePhoto);
      }

      await providerApi.put("/provider/me", formData);
      navigate("/provider/profile", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm">Loading edit form...</p>;

  return (
    <>
      <Helmet>
        <title>Edit Provider Profile</title>
      </Helmet>

      <main className="max-w-3xl space-y-5">
        <section className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">Edit Provider Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep profile details current to improve trust and conversion.
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-6 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-4">
            {form.preview ? (
              <img
                src={form.preview}
                alt="Profile Preview"
                className="h-16 w-16 rounded-full border object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10" />
            )}

            <label className="text-sm cursor-pointer text-primary font-medium">
              Change Photo
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
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <InputField
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
            />
            <InputField
              label="Primary Service"
              value={form.service}
              onChange={(v) => setForm((p) => ({ ...p, service: v }))}
            />
            <InputField
              label="Location"
              value={form.location}
              onChange={(v) => setForm((p) => ({ ...p, location: v }))}
            />
            <InputField
              label="Years of Experience"
              type="number"
              value={form.yearsExperience}
              onChange={(v) =>
                setForm((p) => ({ ...p, yearsExperience: Number(v || 0) }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Bio</label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="mt-1 w-full border rounded-md px-3 py-2"
              placeholder="Tell customers about your expertise and service quality."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-4 rounded-md bg-primary text-white hover:opacity-90"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => navigate("/provider/profile")}
              className="h-10 px-4 rounded-md border"
            >
              Cancel
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

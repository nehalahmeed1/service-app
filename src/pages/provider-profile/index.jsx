import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import providerApi from "@/services/providerApi";
import Icon from "@/components/AppIcon";

const API_BASE = "http://localhost:5000";

function profileStatusClass(status) {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default function ProviderProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await providerApi.get("/provider/me");
        setProfile(res.data?.data || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const avatarUrl = useMemo(() => {
    if (!profile?.avatar) return "";
    if (profile.avatar.startsWith("http")) return profile.avatar;
    return `${API_BASE}${profile.avatar}`;
  }, [profile]);

  if (loading) return <p className="text-sm">Loading profile...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <>
      <Helmet>
        <title>Provider Profile</title>
      </Helmet>

      <main className="space-y-6">
        <section className="rounded-2xl border bg-white p-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <div className="flex gap-4 items-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Provider Avatar"
                  className="h-20 w-20 rounded-full object-cover border"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold">
                  {(profile?.name || "P").charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold">{profile?.name || "Provider"}</h1>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold mt-2 ${profileStatusClass(
                    profile?.status
                  )}`}
                >
                  {profile?.status || "PENDING"}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/provider/profile/edit")}
              className="h-10 px-4 rounded-md bg-primary text-white hover:opacity-90"
            >
              Edit Profile
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-lg mb-4">Professional Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoItem icon="Phone" label="Phone" value={profile?.phone || "-"} />
              <InfoItem icon="Wrench" label="Primary Service" value={profile?.service || "-"} />
              <InfoItem icon="MapPin" label="Location" value={profile?.location || "-"} />
              <InfoItem
                icon="BadgeCheck"
                label="Experience"
                value={`${profile?.yearsExperience || 0} years`}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-lg mb-4">Verification</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Onboarding</span>
                <span className="font-medium">
                  {profile?.onboardingCompleted ? "Submitted" : "Incomplete"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Status</span>
                <span className="font-medium">{profile?.status || "PENDING"}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/provider/verification-center")}
              className="mt-4 w-full h-10 rounded-md border hover:bg-gray-50"
            >
              Open Verification Center
            </button>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold text-lg mb-3">About</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {profile?.bio || "Add a professional bio to improve profile quality and trust."}
          </p>
        </section>
      </main>
    </>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon name={icon} size={13} />
        {label}
      </p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}

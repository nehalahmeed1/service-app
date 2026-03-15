import { useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/AppIcon";

const titles = {
  "/provider/dashboard": "Dashboard",
  "/provider/requests": "Incoming Requests",
  "/provider/jobs": "My Jobs",
  "/provider/earnings": "My Earnings",
  "/provider/performance": "Performance",
  "/provider/schedule": "My Schedule",
  "/provider/verification-center": "Verification Center",
  "/provider/verification-history": "Verification History",
  "/provider/profile": "My Profile",
  "/provider/profile/edit": "Edit Profile",
  "/provider/kpi": "KPI Analytics",
  "/provider/growth-hub": "Growth Hub",
};

export default function ProviderSubHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🚫 DO NOT SHOW ON ONBOARDING
  if (location.pathname.startsWith("/provider/onboarding")) {
    return null;
  }

  // 🚫 Dashboard already has its own header
  if (location.pathname === "/provider/dashboard") {
    return null;
  }

  const current = titles[location.pathname] || "";

  if (!current) return null;

  const goBack = () => {
    if (typeof window !== "undefined" && Number(window.history?.state?.idx) > 0) {
      navigate(-1);
      return;
    }
    navigate("/provider/dashboard");
  };

  return (
    <div className="sticky top-16 z-40 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <Icon name="ArrowLeft" size={16} />
          Back
        </button>

        <span className="text-muted-foreground">/</span>

        <span className="font-medium text-foreground">
          {current}
        </span>
      </div>
    </div>
  );
}

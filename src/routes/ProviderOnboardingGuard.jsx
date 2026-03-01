import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProviderOnboardingGuard() {
  const { user, role, loading, providerOnboardingCompleted } = useAuth();
  const location = useLocation();
  const providerToken = sessionStorage.getItem("provider_token");
  const activeRole = sessionStorage.getItem("active_role");

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "PROVIDER") {
    return <Navigate to="/" replace />;
  }

  const validProviderSession =
    !!providerToken &&
    providerToken !== "undefined" &&
    providerToken !== "null" &&
    activeRole === "PROVIDER";

  if (!validProviderSession) {
    return <Navigate to="/login" replace />;
  }

  // Allow onboarding always
  if (location.pathname.startsWith("/provider/onboarding")) {
    return <Outlet />;
  }

  // Block provider home modules until onboarding is submitted
  if (!providerOnboardingCompleted) {
    return <Navigate to="/provider/onboarding" replace />;
  }

  return <Outlet />;
}

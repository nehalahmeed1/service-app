import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProviderOnboardingGuard() {
  const { user, role, loading, providerOnboardingCompleted } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "PROVIDER") {
    return <Navigate to="/" replace />;
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

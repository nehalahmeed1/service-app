import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProviderOnboardingGuard() {
  const { user, userData, loading } = useAuth();

  // ⛔ Wait until auth + Firestore userData is fully loaded
  if (loading) return null;

  // ⛔ Safety: if auth vanished, go login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⛔ If userData missing, block rendering
  if (!userData) return null;

  // 🔒 If onboarding NOT completed → force onboarding page
  if (userData.role === "provider" && !userData.onboardingCompleted) {
    return <Navigate to="/provider/onboarding" replace />;
  }

  // ✅ Onboarding completed → allow provider routes
  return <Outlet />;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AuthRedirect() {
  const { user, userData, loading } = useAuth();

  // ⛔ HARD BLOCK until Firebase + Firestore fully resolved
  if (loading) {
    return null;
  }

  // ⛔ ABSOLUTE RULE: not logged in = login only
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⛔ Logged in but Firestore not ready yet
  if (!userData) {
    return null;
  }

  // ✅ CUSTOMER
  if (userData.role === "customer") {
    return <Navigate to="/customer/home" replace />;
  }

  // ✅ PROVIDER
  if (userData.role === "provider") {
    // 🔒 Firestore is the ONLY source of truth
    if (userData.onboardingCompleted === false) {
      return <Navigate to="/provider/onboarding" replace />;
    }

    return <Navigate to="/provider/dashboard" replace />;
  }

  // Fallback safety
  return <Navigate to="/login" replace />;
}

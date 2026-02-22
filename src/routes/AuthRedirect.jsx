import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AuthRedirect() {
  const { user, role, loading, providerOnboardingCompleted } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (role === "CUSTOMER") {
    return <Navigate to="/customer/home" replace />;
  }

  if (role === "PROVIDER") {
    return (
      <Navigate
        to={
          providerOnboardingCompleted
            ? "/provider/dashboard"
            : "/provider/onboarding"
        }
        replace
      />
    );
  }

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleRoute({ allowedRole, children }) {
  const { user, role, loading, providerOnboardingCompleted } = useAuth();
  const providerToken = sessionStorage.getItem("provider_token");
  const activeRole = sessionStorage.getItem("active_role");

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Checking permissions...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={allowedRole === "PROVIDER" ? "/provider/login" : "/login"} replace />;
  }

  if (!role) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Setting up your account...
      </div>
    );
  }

  if (role !== allowedRole) {
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

  if (allowedRole === "PROVIDER") {
    const validProviderSession =
      !!providerToken &&
      providerToken !== "undefined" &&
      providerToken !== "null" &&
      activeRole === "PROVIDER";

    if (!validProviderSession) {
      return <Navigate to="/provider/login" replace />;
    }
  }

  return children;
}

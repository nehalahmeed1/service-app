import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleRoute({ allowedRole, children }) {
  const { user, role, loading, providerOnboardingCompleted } = useAuth();

  // ⏳ Wait until auth is ready
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Checking permissions…
      </div>
    );
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for role bootstrap to avoid redirecting to login right after register/login.
  if (!role) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Setting up your account...
      </div>
    );
  }

  // ❌ Wrong role → redirect properly
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

  // ✅ Correct role
  return children;
}

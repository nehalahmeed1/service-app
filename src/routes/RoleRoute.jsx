import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleRoute({ allowedRole, children }) {
  const { user, userData, loading } = useAuth();

  // ⏳ Wait until auth + userData is ready
  if (loading || !userData) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Checking permissions…
      </div>
    );
  }

  // ❌ Not logged in (extra safety)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Wrong role → redirect to correct area
  if (userData.role !== allowedRole) {
    if (userData.role === "customer") {
      return <Navigate to="/customer/home" replace />;
    }

    if (userData.role === "provider") {
      return <Navigate to="/provider/dashboard" replace />;
    }

    // fallback
    return <Navigate to="/" replace />;
  }

  // ✅ Correct role
  return children;
}

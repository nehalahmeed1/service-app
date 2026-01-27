import { Navigate } from "react-router-dom";

export default function AdminRoleGuard({ role, children }) {
  const adminRole = localStorage.getItem("admin_role");

  if (adminRole !== role) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

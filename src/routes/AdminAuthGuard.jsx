import { Navigate, Outlet } from "react-router-dom";

export default function AdminAuthGuard() {
  const token = localStorage.getItem("admin_token");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // ✅ Logged in → allow all admin pages
  return <Outlet />;
}

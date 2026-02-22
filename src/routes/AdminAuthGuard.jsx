import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminAuthGuard() {
  const location = useLocation();
  const token = localStorage.getItem("admin_token");
  const hasValidToken =
    !!token && token !== "undefined" && token !== "null";

  // 🔒 If no admin token → redirect to login
  if (!hasValidToken) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ✅ Token exists → allow access
  return <Outlet />;
}

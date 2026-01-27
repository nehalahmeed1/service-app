import { Outlet, Link, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const role = localStorage.getItem("admin_role");

  const logout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Admin Panel
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link className="block hover:bg-gray-800 p-2 rounded" to="dashboard">
            Dashboard
          </Link>

          {role === "SUPER_ADMIN" && (
            <Link
              className="block hover:bg-gray-800 p-2 rounded"
              to="approvals"
            >
              Admin Approvals
            </Link>
          )}

          <Link className="block hover:bg-gray-800 p-2 rounded" to="categories">
            Categories
          </Link>

          <Link
            className="block hover:bg-gray-800 p-2 rounded"
            to="sub-categories"
          >
            Sub-Categories
          </Link>

          <Link className="block hover:bg-gray-800 p-2 rounded" to="providers">
            Providers
          </Link>

          <Link className="block hover:bg-gray-800 p-2 rounded" to="customers">
            Customers
          </Link>

          {role === "SUPER_ADMIN" && (
            <Link className="block hover:bg-gray-800 p-2 rounded" to="reports">
              Reports
            </Link>
          )}
        </nav>

        <button
          onClick={logout}
          className="m-4 bg-red-600 hover:bg-red-700 rounded p-2"
        >
          Logout
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1">
        <header className="bg-white shadow p-4 flex justify-between">
          <h1 className="font-semibold">Admin Panel</h1>
          <span className="text-sm text-gray-600">{role}</span>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

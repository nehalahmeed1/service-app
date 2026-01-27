import { Outlet } from "react-router-dom";
import CustomerHeader from "@/layouts/components/CustomerHeader";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Customer Header */}
      <CustomerHeader />

      {/* Page content */}
      <main className="flex-1 px-3 py-4 md:px-6 md:py-6">
        <Outlet />
      </main>
    </div>
  );
}

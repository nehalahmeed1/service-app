import { Outlet } from "react-router-dom";
import CustomerHeader from "@/layouts/components/CustomerHeader";
import BackNavigation from "@/components/navigation/BackNavigation";
import CommonFooter from "@/layouts/components/CommonFooter";
import AndroidInstallBanner from "@/components/AndroidInstallBanner";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Customer Header */}
      <CustomerHeader />
      <div className="px-3 pt-3 md:px-6 md:pt-4">
        <AndroidInstallBanner />
      </div>

      {/* Page content */}
      <main className="flex-1 px-3 py-4 md:px-6 md:py-6">
        <BackNavigation className="mx-auto mb-4 w-full max-w-7xl" />
        <Outlet />
      </main>
      <div className="px-3 pb-6 md:px-6 md:pb-8">
        <CommonFooter />
      </div>
    </div>
  );
}

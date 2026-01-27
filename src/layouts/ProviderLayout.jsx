import { Outlet } from "react-router-dom";
import ProviderHeader from "@/layouts/components/ProviderHeader";
import ProviderSubHeader from "@/layouts/components/ProviderSubHeader";

export default function ProviderLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed main header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <ProviderHeader />
      </div>

      {/* Sticky breadcrumb bar */}
      <div className="pt-16 bg-white">
        <ProviderSubHeader />
      </div>

      {/* Scrollable page area */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

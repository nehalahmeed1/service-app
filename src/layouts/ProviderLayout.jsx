import { Outlet } from "react-router-dom";
import ProviderHeader from "@/layouts/components/ProviderHeader";
import ProviderSubHeader from "@/layouts/components/ProviderSubHeader";
import ProviderRail from "@/layouts/components/ProviderRail";

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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-6">
          <div className="flex items-start gap-6">
            <ProviderRail />
            <div className="min-w-0 flex-1">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

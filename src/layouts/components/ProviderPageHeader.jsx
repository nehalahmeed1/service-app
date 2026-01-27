import { useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/AppIcon";

export default function ProviderPageHeader({ title }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on dashboard
  if (location.pathname === "/provider/dashboard") {
    return null;
  }

  return (
    <div className="sticky top-16 z-40 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">

        {/* Back Button */}
        <button
          onClick={() => navigate("/provider/dashboard")}
          className="flex items-center gap-1 text-sm font-medium hover:text-blue-600"
        >
          <Icon name="ArrowLeft" size={18} />
          Dashboard
        </button>

        <span className="text-gray-300">|</span>

        {/* Page Title */}
        <h2 className="text-base sm:text-lg font-semibold">
          {title}
        </h2>
      </div>
    </div>
  );
}

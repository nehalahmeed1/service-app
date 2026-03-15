import { useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/AppIcon";

const ROOT_PAGES = new Set([
  "/customer/home",
  "/provider/dashboard",
  "/admin",
  "/admin/dashboard",
]);

function getFallbackPath(pathname) {
  if (pathname.startsWith("/admin")) return "/admin/dashboard";
  if (pathname.startsWith("/provider")) return "/provider/dashboard";
  return "/customer/home";
}

function hasInAppHistory() {
  if (typeof window === "undefined") return false;
  return Number(window.history?.state?.idx) > 0;
}

export default function BackNavigation({ className = "", label = "Back" }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (ROOT_PAGES.has(pathname)) return null;

  const fallbackPath = getFallbackPath(pathname);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => {
          if (hasInAppHistory()) {
            navigate(-1);
            return;
          }
          navigate(fallbackPath);
        }}
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        aria-label={label}
      >
        <Icon name="ArrowLeft" size={16} />
        <span>{label}</span>
      </button>
    </div>
  );
}

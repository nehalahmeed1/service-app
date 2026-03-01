import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/components/AppIcon";

const ITEMS = [
  { to: "/provider/dashboard", labelKey: "dashboard", icon: "LayoutDashboard" },
  { to: "/provider/verification-center", labelKey: "verification_center", icon: "BadgeCheck" },
  { to: "/provider/verification-history", labelKey: "verification_history", icon: "History" },
  { to: "/provider/kpi", labelKey: "kpi_analytics", icon: "LineChart" },
  { to: "/provider/growth-hub", labelKey: "growth_hub", icon: "Rocket" },
  { to: "/provider/requests", labelKey: "requests", icon: "Inbox" },
  { to: "/provider/jobs", labelKey: "jobs", icon: "BriefcaseBusiness" },
  { to: "/provider/earnings", labelKey: "earnings", icon: "Wallet" },
  { to: "/provider/schedule", labelKey: "schedule", icon: "CalendarDays" },
  { to: "/provider/services", labelKey: "services", icon: "Wrench" },
  { to: "/provider/profile", labelKey: "profile", icon: "UserRound" },
];

export default function ProviderRail() {
  const location = useLocation();
  const { t } = useTranslation();

  if (location.pathname.startsWith("/provider/onboarding")) {
    return null;
  }

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 rounded-xl border bg-white p-3">
        <p className="px-2 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
          {t("provider_navigation")}
        </p>
        <nav className="space-y-1">
          {ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `h-10 px-3 rounded-md text-sm flex items-center gap-2 transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-gray-100"
                }`
              }
            >
              <Icon name={item.icon} size={15} />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

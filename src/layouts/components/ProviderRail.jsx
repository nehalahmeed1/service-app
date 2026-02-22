import { NavLink, useLocation } from "react-router-dom";
import Icon from "@/components/AppIcon";

const ITEMS = [
  { to: "/provider/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { to: "/provider/verification-center", label: "Verification Center", icon: "BadgeCheck" },
  { to: "/provider/verification-history", label: "Verification History", icon: "History" },
  { to: "/provider/kpi", label: "KPI Analytics", icon: "LineChart" },
  { to: "/provider/growth-hub", label: "Growth Hub", icon: "Rocket" },
  { to: "/provider/requests", label: "Requests", icon: "Inbox" },
  { to: "/provider/jobs", label: "Jobs", icon: "BriefcaseBusiness" },
  { to: "/provider/earnings", label: "Earnings", icon: "Wallet" },
  { to: "/provider/schedule", label: "Schedule", icon: "CalendarDays" },
  { to: "/provider/services", label: "Services", icon: "Wrench" },
  { to: "/provider/profile", label: "Profile", icon: "UserRound" },
];

export default function ProviderRail() {
  const location = useLocation();

  if (location.pathname.startsWith("/provider/onboarding")) {
    return null;
  }

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 rounded-xl border bg-white p-3">
        <p className="px-2 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Provider Navigation
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
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

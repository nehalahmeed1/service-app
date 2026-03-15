import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchApprovalNotifications,
  markApprovalNotificationsRead,
} from "@/services/approvalService";
import Icon from "@/components/AppIcon";
import BackNavigation from "@/components/navigation/BackNavigation";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const role = localStorage.getItem("admin_role");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  useEffect(() => {
    const previousLanguage = i18n.language;
    if (previousLanguage !== "en") {
      i18n.changeLanguage("en");
    }

    return () => {
      const preferredLanguage = localStorage.getItem("app_language") || previousLanguage || "en";
      if (i18n.language !== preferredLanguage) {
        i18n.changeLanguage(preferredLanguage);
      }
    };
  }, [i18n]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchApprovalNotifications();
        setNotifications(data?.notifications || []);
        setUnreadCount(Number(data?.unreadCount || 0));
      } catch (error) {
        console.error("Failed to load admin notifications", error);
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openNotifications) return;

    const markAsRead = async () => {
      try {
        await markApprovalNotificationsRead();
        setUnreadCount(0);
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    };

    markAsRead();
  }, [openNotifications]);

  const navContent = (
    <nav className="flex-1 p-4 space-y-2">
      <Link className="block hover:bg-gray-800 p-2 rounded" to="dashboard" onClick={() => setMobileNavOpen(false)}>
        {t("dashboard")}
      </Link>

      {role === "SUPER_ADMIN" && (
        <Link className="block hover:bg-gray-800 p-2 rounded" to="approvals" onClick={() => setMobileNavOpen(false)}>
          {t("admin_approvals")}
        </Link>
      )}

      <Link className="block hover:bg-gray-800 p-2 rounded" to="categories" onClick={() => setMobileNavOpen(false)}>
        {t("categories")}
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="sub-categories" onClick={() => setMobileNavOpen(false)}>
        {t("sub_categories")}
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="providers" onClick={() => setMobileNavOpen(false)}>
        {t("providers")}
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="customers" onClick={() => setMobileNavOpen(false)}>
        {t("customers")}
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="service-requests" onClick={() => setMobileNavOpen(false)}>
        {t("service_requests")}
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="bookings" onClick={() => setMobileNavOpen(false)}>
        Bookings Flow
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="completed-jobs" onClick={() => setMobileNavOpen(false)}>
        Completed Jobs Evidence
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="payments" onClick={() => setMobileNavOpen(false)}>
        {t("payments")}
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="audit-logs" onClick={() => setMobileNavOpen(false)}>
        {t("audit_logs")}
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="support-requests" onClick={() => setMobileNavOpen(false)}>
        Support Requests
      </Link>

      <Link className="block hover:bg-gray-800 p-2 rounded" to="escalations" onClick={() => setMobileNavOpen(false)}>
        Escalations
      </Link>

      {role === "SUPER_ADMIN" && (
        <Link className="block hover:bg-gray-800 p-2 rounded" to="reports" onClick={() => setMobileNavOpen(false)}>
          {t("reports")}
        </Link>
      )}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          {t("admin_panel")}
        </div>
        {navContent}

        <button
          onClick={logout}
          className="m-4 bg-red-600 hover:bg-red-700 rounded p-2"
        >
          {t("logout")}
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1">
        <header className="bg-white shadow p-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="md:hidden rounded border px-2 py-1 text-sm"
              aria-label="Open admin menu"
            >
              Menu
            </button>
            <h1 className="font-semibold">{t("admin_panel")}</h1>
          </div>
          <div className="flex items-center gap-4 relative">
            <button
              type="button"
              onClick={() => setOpenNotifications((prev) => !prev)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-slate-700 hover:bg-gray-50"
              title="Provider update notifications"
              aria-label={t("notifications")}
            >
              <Icon name="Bell" size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>

            {openNotifications ? (
              <div className="absolute right-0 top-11 z-20 w-[92vw] max-w-[360px] rounded-lg border bg-white shadow-lg">
                <div className="border-b px-3 py-2 text-sm font-semibold">
                  {t("recent_provider_updates")}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-gray-500">
                      {t("no_new_onboarding_updates")}
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <Link
                        key={item.id}
                        to={`/admin/approvals/${item.providerId}`}
                        className="block border-b px-3 py-2 hover:bg-gray-50"
                        onClick={() => setOpenNotifications(false)}
                      >
                        <p className="text-sm font-medium">{item.providerName}</p>
                        <p className="text-xs text-gray-600">
                          {item.action} {t("on")} {item.section} ({item.status})
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            <span className="hidden sm:inline text-sm text-gray-600">{role}</span>
          </div>
        </header>

        {mobileNavOpen ? (
          <div className="md:hidden border-b bg-gray-900 text-white">
            {navContent}
            <button
              onClick={logout}
              className="m-4 bg-red-600 hover:bg-red-700 rounded p-2 w-[calc(100%-2rem)]"
            >
              {t("logout")}
            </button>
          </div>
        ) : null}

        <div className="p-3 sm:p-6">
          <BackNavigation className="mb-4" />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

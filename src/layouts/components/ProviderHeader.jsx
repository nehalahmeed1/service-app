import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Icon from "@/components/AppIcon";
import { fetchIncomingRequests } from "@/services/providerBookingService";

const PROVIDER_BOOKING_LAST_SEEN_KEY = "provider_booking_last_seen_at";

export default function ProviderHeader() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const { t } = useTranslation();
  const { user, providerProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setOpenNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const rows = await fetchIncomingRequests();
        const updates = (Array.isArray(rows) ? rows : []).map((item) => ({
          id: item.id,
          title: `${item.serviceName} - ${item.customerName}`,
          subtitle: `${item.date} | ${item.time}`,
          at: item.createdAt,
        }));
        setNotifications(updates);

        const lastSeen = localStorage.getItem(PROVIDER_BOOKING_LAST_SEEN_KEY);
        const unread = lastSeen
          ? updates.filter((item) => new Date(item.at) > new Date(lastSeen)).length
          : updates.length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to load provider notifications", error);
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/provider/login", { replace: true });
  };

  const toggleNotifications = () => {
    setOpenNotifications((prev) => !prev);
    localStorage.setItem(PROVIDER_BOOKING_LAST_SEEN_KEY, new Date().toISOString());
    setUnreadCount(0);
  };

  const getName = () => {
    if (providerProfile?.name) return providerProfile.name;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return t("provider");
  };

  const getInitial = () => getName().charAt(0).toUpperCase();

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b bg-white sticky top-0 z-40">
      <h3 className="font-semibold text-base">{t("appName")}</h3>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        <div ref={notificationRef} className="relative">
          <button
            onClick={toggleNotifications}
            className="w-9 h-9 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center relative"
            aria-label="Booking notifications"
          >
            <Icon name="Bell" size={16} />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {openNotifications ? (
            <div className="absolute right-0 top-12 w-80 rounded-lg border bg-white shadow-lg text-sm z-50 overflow-hidden">
              <div className="px-4 py-2 border-b bg-slate-50 font-semibold">
                {t("booking_notifications")}
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-3 text-gray-500">{t("no_new_booking_requests")}</p>
              ) : (
                notifications.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setOpenNotifications(false);
                      navigate("/provider/requests");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b"
                  >
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                  </button>
                ))
              )}
              <button
                onClick={() => {
                  setOpenNotifications(false);
                  navigate("/provider/requests");
                }}
                className="w-full px-4 py-2 text-blue-600 bg-slate-50 font-medium hover:bg-slate-100"
              >
                {t("view_all_requests")}
              </button>
            </div>
          ) : null}
        </div>

        {user && (
          <div ref={menuRef} className="relative flex items-center gap-2">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold"
            >
              {getInitial()}
            </button>

            <span className="hidden md:inline text-sm text-gray-700">
              {t("hi")}, {getName()} ({t("provider")})
            </span>

            {open && (
              <div className="absolute right-0 top-12 w-44 rounded-lg border bg-white shadow-lg text-sm z-50">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/provider/profile");
                  }}
                  className="px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                  {t("my_profile")}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/provider/verification-center");
                  }}
                  className="px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                  {t("verification_center")}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/provider/kpi");
                  }}
                  className="px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                  {t("kpi_analytics")}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 w-full text-left text-red-600 hover:bg-gray-100"
                >
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

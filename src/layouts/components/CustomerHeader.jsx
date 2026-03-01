import { useRef, useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Icon from "@/components/AppIcon";
import { fetchCustomerBookings } from "@/services/customerBookingService";

const LOCATION_KEY = "customer_location";
const RECENTS_KEY = "customer_location_recents";
const BOOKING_LAST_SEEN_KEY = "customer_booking_last_seen_at";

const DEFAULT_LOCATION = "Mancherial";
const FALLBACK_SUGGESTIONS = [
  "Boduppal, Secunderabad, Telangana",
  "Kukatpally, Hyderabad, Telangana",
  "Madhapur, Hyderabad, Telangana",
  "Ameerpet, Hyderabad, Telangana",
  "Gachibowli, Hyderabad, Telangana",
  "Miyapur, Hyderabad, Telangana",
];
const toStatusLabel = (value) =>
  (value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function CustomerHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const notifyRef = useRef(null);
  const locationRef = useRef(null);
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
  const [locationQuery, setLocationQuery] = useState("");
  const [recentLocations, setRecentLocations] = useState([]);
  const [locating, setLocating] = useState(false);
  const [bookingUpdates, setBookingUpdates] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setOpenNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    try {
      const rawProfile = localStorage.getItem("customer_profile");
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile);
        if (parsed?.fullName) setProfileName(parsed.fullName);
      }
    } catch (error) {
      console.error("Failed to read customer profile", error);
    }

    try {
      const savedLocation = localStorage.getItem(LOCATION_KEY);
      if (savedLocation) setSelectedLocation(savedLocation);

      const savedRecents = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
      if (Array.isArray(savedRecents)) setRecentLocations(savedRecents);
    } catch (error) {
      console.error("Failed to read saved locations", error);
    }
  }, []);

  useEffect(() => {
    const loadBookingUpdates = async () => {
      if (!user) {
        setBookingUpdates([]);
        setUnreadCount(0);
        return;
      }

      try {
        const bookings = await fetchCustomerBookings();
        const updates = bookings
          .filter((booking) => booking.status !== "BOOKED")
          .map((booking) => {
            const latest = booking.statusHistory?.[booking.statusHistory.length - 1];
            return {
              id: `${booking.id}-${latest?.status || booking.status}`,
              bookingId: booking.id,
              status: booking.status,
              serviceName: booking.serviceName,
              note: latest?.note || "",
              at: latest?.at || booking.createdAt,
            };
          })
          .sort((a, b) => new Date(b.at) - new Date(a.at));

        setBookingUpdates(updates);

        const lastSeen = localStorage.getItem(BOOKING_LAST_SEEN_KEY);
        const unread = lastSeen
          ? updates.filter((item) => new Date(item.at) > new Date(lastSeen)).length
          : updates.length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to load booking updates", error);
      }
    };

    loadBookingUpdates();
    const timer = setInterval(loadBookingUpdates, 30000);
    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    if (!openLocationModal) return;
    const timer = setTimeout(() => locationRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, [openLocationModal]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/customer/home", { replace: true });
  };

  const getName = () => {
    if (profileName) return profileName;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return t("customer", { defaultValue: "Customer" });
  };

  const isMarketplaceHeader =
    location.pathname === "/customer/home" ||
    location.pathname.startsWith("/customer/services/");

  const searchParams = new URLSearchParams(location.search);
  const headerQuery = searchParams.get("q") || "";

  const updateHeaderSearch = (value) => {
    const next = new URLSearchParams(location.search);
    if (value?.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    navigate(`${location.pathname}${next.toString() ? `?${next.toString()}` : ""}`, { replace: true });
  };

  const suggestions = useMemo(() => {
    const source = [...recentLocations, ...FALLBACK_SUGGESTIONS];
    const unique = Array.from(new Set(source));
    const q = locationQuery.trim().toLowerCase();
    if (!q) return unique.slice(0, 8);
    return unique.filter((item) => item.toLowerCase().includes(q)).slice(0, 8);
  }, [locationQuery, recentLocations]);

  const saveLocation = (value) => {
    const clean = value?.trim();
    if (!clean) return;
    setSelectedLocation(clean);
    localStorage.setItem(LOCATION_KEY, clean);

    const nextRecents = [clean, ...recentLocations.filter((x) => x !== clean)].slice(0, 6);
    setRecentLocations(nextRecents);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(nextRecents));

    setOpenLocationModal(false);
    setLocationQuery("");
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert(t("geolocation_not_supported"));
      return;
    }

    try {
      setLocating(true);
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const res = await fetch(url);
      const data = await res.json();
      const label =
        data?.display_name ||
        `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      saveLocation(label);
    } catch (error) {
      console.error("Current location failed", error);
      alert("Unable to fetch current location.");
    } finally {
      setLocating(false);
    }
  };

  const openNotificationsPanel = () => {
    if (!user) {
      navigate("/login", {
        state: { redirectTo: "/customer/bookings", source: "booking_updates" },
      });
      return;
    }

    setOpenNotifications((prev) => !prev);
    localStorage.setItem(BOOKING_LAST_SEEN_KEY, new Date().toISOString());
    setUnreadCount(0);
  };

  return (
    <>
      <header
        style={{
          ...styles.header,
          padding: isMobile ? "8px 12px" : styles.header.padding,
          flexWrap: isMobile ? "wrap" : "nowrap",
          rowGap: isMobile ? 8 : 0,
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/customer/home")}
          style={styles.logoBtn}
        >
          <h2 style={styles.logo}>{t("appName")}</h2>
        </button>
        {isMarketplaceHeader && (
          <div
            style={{
              ...styles.marketControls,
              marginLeft: isMobile ? 0 : styles.marketControls.marginLeft,
              maxWidth: isMobile ? "100%" : styles.marketControls.maxWidth,
              width: isMobile ? "100%" : "auto",
              order: isMobile ? 3 : 0,
              marginTop: isMobile ? 4 : 0,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenLocationModal(true)}
              style={{
                ...styles.locationWrap,
                width: isMobile ? 150 : styles.locationWrap.width,
              }}
            >
              <Icon name="MapPin" size={15} className="text-slate-400" />
              <input value={selectedLocation} readOnly style={styles.locationInput} />
              <Icon name="ChevronDown" size={14} className="text-slate-400" />
            </button>
            <div style={styles.searchWrap}>
              <Icon name="Search" size={15} className="text-slate-400" />
              <input
                value={headerQuery}
                onChange={(e) => updateHeaderSearch(e.target.value)}
                placeholder={t("search_services", { defaultValue: "Search for 'AC service'" })}
                style={styles.searchInput}
              />
            </div>
          </div>
        )}

        <div style={{ ...styles.right, gap: isMobile ? 10 : styles.right.gap }}>
          <LanguageSwitcher />

          <div ref={notifyRef} style={styles.notifyWrap}>
            <button type="button" onClick={openNotificationsPanel} style={styles.notifyBtn}>
              <Icon name="Bell" size={16} />
              {unreadCount > 0 ? <span style={styles.notifyBadge}>{unreadCount}</span> : null}
            </button>

            {openNotifications ? (
              <div
                style={{
                  ...styles.notificationDropdown,
                  width: isMobile ? "92vw" : styles.notificationDropdown.width,
                }}
              >
                <p style={styles.notificationTitle}>{t("booking_updates")}</p>
                {bookingUpdates.length === 0 ? (
                  <p style={styles.notificationEmpty}>{t("no_updates_yet")}</p>
                ) : (
                  bookingUpdates.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      style={styles.notificationItem}
                      onClick={() => {
                        setOpenNotifications(false);
                        navigate("/customer/bookings");
                      }}
                    >
                      <p style={styles.notificationText}>
                        {item.serviceName} - {toStatusLabel(item.status)}
                      </p>
                      <p style={styles.notificationMeta}>{item.note || t("status_updated")}</p>
                    </button>
                  ))
                )}
                <button
                  style={styles.notificationViewAll}
                  onClick={() => {
                    setOpenNotifications(false);
                    navigate("/customer/bookings");
                  }}
                >
                  {t("view_all_bookings")}
                </button>
              </div>
            ) : null}
          </div>

          {user && (
            <div ref={menuRef} style={styles.userBox}>
              <button onClick={() => setOpen((p) => !p)} style={styles.avatar}>
                {getName().charAt(0).toUpperCase()}
              </button>

              {!isMobile && <span style={styles.name}>
                {t("hi", { defaultValue: "Hi" })}, {getName()}
              </span>}

              {open && (
                <div style={styles.dropdown}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/customer/profile");
                    }}
                    style={styles.menuBtn}
                  >
                    {t("my_profile", { defaultValue: "My Profile" })}
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/customer/bookings");
                    }}
                    style={styles.menuBtn}
                  >
                    {t("my_bookings", { defaultValue: "My Bookings" })}
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/customer/home");
                    }}
                    style={styles.menuBtn}
                  >
                    {t("find_service_providers", { defaultValue: "Find Services" })}
                  </button>
                  <button onClick={handleLogout} style={styles.logout}>
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div ref={menuRef} style={styles.userBox}>
              <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                style={styles.guestProfileBtn}
                title={t("profile")}
                aria-label={t("profile")}
              >
                <Icon name="CircleUserRound" size={18} />
              </button>

              {open && (
                <div style={styles.dropdown}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/login", {
                        state: { redirectTo: "/customer/home", source: "profile_icon" },
                      });
                    }}
                    style={styles.menuBtn}
                  >
                    {t("login")}
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/register/customer");
                    }}
                    style={styles.menuBtn}
                  >
                    {t("register")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {openLocationModal ? (
        <div style={styles.modalOverlay} onClick={() => setOpenLocationModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenLocationModal(false)}
              style={styles.closeBtn}
            >
              <Icon name="X" size={18} />
            </button>

            <div style={styles.locationSearchWrap}>
              <Icon name="ArrowLeft" size={17} />
              <input
                ref={locationRef}
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder={t("search_location_placeholder")}
                style={styles.locationSearchInput}
              />
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              style={styles.currentLocationBtn}
              disabled={locating}
            >
              <Icon name="LocateFixed" size={16} />
              {locating ? t("detecting_current_location") : t("use_current_location")}
            </button>

            <div style={styles.sectionDivider} />

            <div style={styles.recentsSection}>
              <h4 style={styles.recentsTitle}>{t("recents")}</h4>
              {(locationQuery ? suggestions : recentLocations).slice(0, 8).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => saveLocation(item)}
                  style={styles.recentItem}
                >
                  <div style={styles.recentIcon}>
                    <Icon name={recentLocations.includes(item) ? "History" : "MapPin"} size={14} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={styles.recentLabel}>{item.split(",")[0]}</p>
                    <p style={styles.recentMeta}>{item}</p>
                  </div>
                </button>
              ))}
            </div>

            <p style={styles.poweredBy}>{t("powered_by_google")}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

const styles = {
  header: {
    minHeight: 64,
    padding: "0 24px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  logo: {
    fontSize: 20,
    fontWeight: 600,
  },
  logoBtn: {
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    lineHeight: 1,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginLeft: "auto",
  },
  marketControls: {
    marginLeft: 24,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    maxWidth: 640,
  },
  locationWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: 250,
    height: 42,
    border: "1px solid #cbd5e1",
    borderRadius: 14,
    padding: "0 12px",
    background: "#fff",
    cursor: "pointer",
  },
  locationInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "transparent",
    cursor: "pointer",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    height: 42,
    border: "1px solid #cbd5e1",
    borderRadius: 14,
    padding: "0 12px",
    background: "#fff",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "transparent",
  },
  userBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  notifyWrap: {
    position: "relative",
  },
  notifyBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid #d1d5db",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
  },
  notifyBadge: {
    position: "absolute",
    top: -5,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    background: "#ef4444",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
  },
  notificationDropdown: {
    position: "absolute",
    top: 46,
    right: 0,
    width: 320,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    overflow: "hidden",
    zIndex: 120,
  },
  notificationTitle: {
    margin: 0,
    padding: "10px 12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },
  notificationEmpty: {
    margin: 0,
    padding: "12px",
    fontSize: 13,
    color: "#64748b",
  },
  notificationItem: {
    width: "100%",
    border: "none",
    background: "#fff",
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "1px solid #f8fafc",
    cursor: "pointer",
  },
  notificationText: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
  },
  notificationMeta: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#64748b",
  },
  notificationViewAll: {
    width: "100%",
    border: "none",
    background: "#f8fafc",
    color: "#1d4ed8",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    padding: "10px 12px",
    textAlign: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
  guestProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 14,
    color: "#374151",
  },
  dropdown: {
    position: "absolute",
    top: 46,
    right: 0,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  menuBtn: {
    padding: "10px 14px",
    width: "100%",
    border: "none",
    background: "none",
    textAlign: "left",
    cursor: "pointer",
    color: "#0f172a",
    fontWeight: 500,
  },
  logout: {
    padding: "10px 14px",
    width: "100%",
    border: "none",
    background: "none",
    textAlign: "left",
    cursor: "pointer",
    color: "#dc2626",
    fontWeight: 500,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 600,
    minHeight: 420,
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: -46,
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  locationSearchWrap: {
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "0 12px",
    height: 46,
  },
  locationSearchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 15,
  },
  currentLocationBtn: {
    marginTop: 14,
    border: "none",
    background: "transparent",
    color: "#4f46e5",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
  },
  sectionDivider: {
    marginTop: 22,
    borderTop: "8px solid #f3f4f6",
    marginLeft: -16,
    marginRight: -16,
  },
  recentsSection: {
    marginTop: 16,
  },
  recentsTitle: {
    fontSize: 32,
    fontWeight: 700,
    margin: 0,
  },
  recentItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "12px 0",
    display: "flex",
    gap: 12,
    borderBottom: "1px solid #f1f5f9",
  },
  recentIcon: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "#f3f4f6",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  recentLabel: {
    margin: 0,
    fontSize: 23,
    fontWeight: 600,
    color: "#111827",
  },
  recentMeta: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#4b5563",
  },
  poweredBy: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
  },
};

import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

export default function CustomerHeader() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { userData } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  // 🌍 Proper native language labels
  const languageLabels = {
    en: "English",
    hi: "हिंदी",
    te: "తెలుగు",
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  const getName = () => {
    if (!userData) return "";
    return userData.fullName || userData.name || "Customer";
  };

  const getInitial = () => getName().charAt(0).toUpperCase();

  return (
    <header style={styles.header}>
      {/* Logo */}
      <h2 style={styles.logo}>ServiceConnect</h2>

      <div style={styles.right}>
        {/* 🌐 Language Switcher */}
        <div style={styles.lang}>
          {["en", "hi", "te"].map((lng) => (
            <button
              key={lng}
              onClick={() => setLanguage(lng)}
              style={{
                ...styles.langBtn,
                ...(language === lng ? styles.langActive : {}),
              }}
            >
              {languageLabels[lng]}
            </button>
          ))}
        </div>

        {/* 👤 User Menu */}
        {userData && (
          <div ref={menuRef} style={styles.userBox}>
            <button
              onClick={() => setOpen((p) => !p)}
              style={styles.avatar}
            >
              {getInitial()}
            </button>

            <span style={styles.name}>
              {t("hi")}, {getName()}
            </span>

            {open && (
              <div style={styles.dropdown}>
                <button onClick={handleLogout} style={styles.logout}>
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

const styles = {
  header: {
    height: 64,
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

  right: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },

  lang: {
    display: "flex",
    gap: 6,
  },

  langBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    padding: "4px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
  },

  langActive: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
  },

  userBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
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
};

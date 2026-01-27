import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

export default function Register() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Language Switch */}
        <div style={styles.langRow}>
          <button
            onClick={() => setLanguage("en")}
            style={language === "en" ? styles.langActive : styles.langBtn}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("hi")}
            style={language === "hi" ? styles.langActive : styles.langBtn}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage("te")}
            style={language === "te" ? styles.langActive : styles.langBtn}
          >
            తెలుగు
          </button>
        </div>

        <h2 style={styles.title}>{t("registerAs")}</h2>

        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/register/customer")}
        >
          {t("registerCustomer")}
        </button>

        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/register/provider")}
        >
          {t("registerProvider")}
        </button>

        <button
          style={styles.linkBtn}
          onClick={() => navigate("/login")}
        >
          {t("backToLogin")}
        </button>
      </div>
    </div>
  );
}

/* UI STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
  },
  card: {
    width: 360,
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  langRow: {
    textAlign: "right",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 20,
  },
  primaryBtn: {
    width: "100%",
    height: 44,
    marginBottom: 12,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
  },
  linkBtn: {
    marginTop: 8,
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 13,
  },
  langBtn: {
    marginLeft: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  langActive: {
    marginLeft: 6,
    fontWeight: "bold",
    textDecoration: "underline",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/firebase";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

export default function Login() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert(t("enterValidMobile"));
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/", { replace: true });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert(t("enterValidMobile"));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert(t("resetSent") || "Reset email sent");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* 🌍 Language Switch */}
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

        <h2 style={styles.title}>{t("loginTitle")}</h2>
        <p style={styles.subtitle}>{t("loginSubtitle")}</p>

        {/* Email */}
        <input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        {/* Password */}
        <div style={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.passwordInput}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            style={styles.eye}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button onClick={handleForgotPassword} style={styles.forgotBtn}>
          {t("forgot")}
        </button>

        <button
          style={styles.loginBtn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "..." : t("loginButton")}
        </button>

        <p style={styles.footer}>
          {t("newHere")}{" "}
          <button
            onClick={() => navigate("/register")}
            style={styles.linkBtn}
          >
            {t("register")}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ✅ PERFECTLY ALIGNED STYLES */
const INPUT_HEIGHT = 44;

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
  },

  langRow: {
    textAlign: "right",
    marginBottom: 12,
  },

  title: {
    textAlign: "center",
    marginBottom: 4,
    fontSize: 20,
    fontWeight: 600,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 16,
    color: "#6b7280",
    fontSize: 13,
  },

  input: {
    width: "100%",
    height: INPUT_HEIGHT,
    padding: "0 12px",
    marginBottom: 12,
    border: "1px solid #ccc",
    borderRadius: 4,
    boxSizing: "border-box",
  },

  passwordWrapper: {
    position: "relative",
    marginBottom: 8,
  },

  passwordInput: {
    width: "100%",
    height: INPUT_HEIGHT,
    padding: "0 44px 0 12px",
    border: "1px solid #ccc",
    borderRadius: 4,
    boxSizing: "border-box",
  },

  eye: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },

  forgotBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    marginBottom: 14,
    textAlign: "right",
    width: "100%",
    fontSize: 13,
  },

  loginBtn: {
    width: "100%",
    height: INPUT_HEIGHT,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },

  footer: {
    marginTop: 16,
    fontSize: 13,
  },

  linkBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
  },

  langBtn: {
    marginLeft: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
  },

  langActive: {
    marginLeft: 6,
    fontWeight: "bold",
    textDecoration: "underline",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
  },
};

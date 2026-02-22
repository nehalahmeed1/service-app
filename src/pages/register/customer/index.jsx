import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import axios from "axios";

import { auth, db } from "@/firebase";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CustomerRegister() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      alert(t("fillAllFields") || "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      /* 1️⃣ Firebase Authentication */
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const uid = userCredential.user.uid;

      /* 2️⃣ Firestore User Profile */
      await setDoc(doc(db, "users", uid), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: "customer",
        createdAt: new Date(),
      });

      /* 3️⃣ 🔁 Sync Customer to MongoDB */
      await axios.post(`${API_BASE_URL}/auth/customer/register`, {
        firebaseUid: uid,
        name: form.name,
        email: form.email,
      });

      /* 4️⃣ Redirect */
      navigate("/customer/home", { replace: true });
    } catch (error) {
      console.error("Customer register error:", error);
      alert(error?.response?.data?.message || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* 🌐 Language Switch */}
        <div style={{ textAlign: "right", marginBottom: 10 }}>
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

        <h2 style={styles.title}>
          {t("customer")} {t("register")}
        </h2>

        <input
          style={styles.input}
          placeholder={t("fullName") || "Full Name"}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder={t("email") || "Email"}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder={t("phoneNumber") || "Phone"}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        {/* 🔐 Password */}
        <div style={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("password") || "Password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
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

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? t("registering") || "Registering..." : t("register")}
        </button>

        <button style={styles.link} onClick={() => navigate("/register")}>
          {t("back") || "Back"}
        </button>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
  },
  card: {
    width: 380,
    maxWidth: "92%",
    background: "#ffffff",
    padding: 24,
    borderRadius: 10,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: 600,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 44,
    padding: "0 12px",
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
  },
  passwordWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  passwordInput: {
    width: "100%",
    height: 44,
    padding: "0 44px 0 12px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
  },
  eye: {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    width: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
  },
  btn: {
    width: "100%",
    padding: 12,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    marginTop: 8,
    cursor: "pointer",
  },
  link: {
    marginTop: 12,
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
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

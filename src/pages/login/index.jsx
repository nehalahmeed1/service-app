import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "@/firebase";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACTIVE_ROLE_KEY = "active_role";
const setSession = (k, v) => sessionStorage.setItem(k, v);
const removeSession = (k) => sessionStorage.removeItem(k);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postWithRetry(url, payload, options = {}) {
  const retries = options.retries ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 500;
  const retryStatuses = options.retryStatuses ?? [403, 404, 429, 500, 502, 503, 504];

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await axios.post(url, payload);
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const canRetry = attempt < retries && retryStatuses.includes(status);
      if (!canRetry) {
        throw error;
      }
      await wait(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError;
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || "/customer/home";
  const isProviderLogin = location.pathname === "/provider/login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefilledEmail = location.state?.email;
    if (prefilledEmail && !email) {
      setEmail(prefilledEmail);
    }
  }, [location.state, email]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert(t("enterCredentials"));
      return;
    }

    try {
      setLoading(true);
      await setPersistence(auth, browserSessionPersistence);

      // 🔥 STEP 1: Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await cred.user.getIdToken();

      const resolved = await postWithRetry(
        `${API_BASE_URL}/auth/firebase-login`,
        { firebaseToken },
        { retries: 2, retryDelayMs: 450 }
      );
      const role = resolved?.data?.role;

      if (role === "CUSTOMER") {
        if (isProviderLogin) {
          await auth.signOut();
          alert(t("provider_login_customer_blocked"));
          return;
        }

        await axios.post(`${API_BASE_URL}/auth/customer/firebase-login`, {
          firebaseToken,
        });

        setSession(ACTIVE_ROLE_KEY, "CUSTOMER");
        removeSession("provider_token");
        removeSession("provider_onboarding_completed");
        removeSession("provider_status");
        navigate(redirectTo, { replace: true });
        return;
      }

      if (role === "PROVIDER") {
        const providerRes = await postWithRetry(
          `${API_BASE_URL}/auth/provider/firebase-login`,
          { firebaseToken },
          { retries: 3, retryDelayMs: 600 }
        );

        setSession(ACTIVE_ROLE_KEY, "PROVIDER");
        setSession("provider_token", providerRes.data.token);
        const done = !!providerRes.data.provider?.onboardingCompleted;
        const status = providerRes.data.provider?.status || "PENDING";
        setSession("provider_onboarding_completed", done ? "true" : "false");
        setSession("provider_status", status);
        navigate(done ? "/provider/dashboard" : "/provider/onboarding", {
          replace: true,
        });
        return;
      }

      // ❌ No account found
      alert(t("user_not_found_register_first"));
      await auth.signOut();

    } catch (error) {
      console.error("Login error:", error);
      if (error?.code === "auth/invalid-credential") {
        alert("Invalid email or password. Please try again or reset password.");
        return;
      }
      alert(error?.response?.data?.message || t("login_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert(t("enterEmail"));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert(t("resetSent"));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>{t("login")}</h2>

        <input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

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
            👁️
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
          {loading ? t("loggingIn") : t("loginButton")}
        </button>

        <div style={styles.registerWrap}>
          <p style={styles.registerText}>{t("newHere")}</p>
          <button
            type="button"
            style={styles.registerLink}
            onClick={() =>
              navigate(isProviderLogin ? "/register/provider" : "/register/customer")
            }
          >
            {t("register_here")}
          </button>
        </div>
      </div>
    </div>
  );
}

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
    maxWidth: "92%",
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: { textAlign: "center", marginBottom: 16, fontSize: 20 },
  input: {
    width: "100%",
    height: INPUT_HEIGHT,
    padding: "0 12px",
    marginBottom: 12,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  passwordWrapper: { position: "relative", marginBottom: 8 },
  passwordInput: {
    width: "100%",
    height: INPUT_HEIGHT,
    padding: "0 44px 0 12px",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  eye: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  forgotBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    marginBottom: 14,
    textAlign: "right",
    width: "100%",
  },
  loginBtn: {
    width: "100%",
    height: INPUT_HEIGHT,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  registerWrap: {
    marginTop: 14,
    textAlign: "center",
  },
  registerText: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
  },
  registerLink: {
    marginTop: 4,
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 600,
  },
};

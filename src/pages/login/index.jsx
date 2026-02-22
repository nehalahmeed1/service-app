import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/firebase";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    try {
      setLoading(true);

      // 🔥 STEP 1: Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await cred.user.getIdToken();

      /* ===============================
         ROLE DETECTION (SAME AS AUTHCONTEXT)
      =============================== */

      // 1️⃣ Try Provider
      try {
        const providerRes = await axios.post(
          `${API_BASE_URL}/auth/provider/firebase-login`,
          { firebaseToken }
        );

        if (providerRes.data.role === "PROVIDER") {
          const done = !!providerRes.data.provider?.onboardingCompleted;
          const status = providerRes.data.provider?.status || "PENDING";
          localStorage.setItem(
            "provider_onboarding_completed",
            done ? "true" : "false"
          );
          localStorage.setItem("provider_status", status);
          navigate(
            done ? "/provider/dashboard" : "/provider/onboarding",
            { replace: true }
          );
          return;
        }
      } catch (err) {}

      // 2️⃣ Try Customer
      try {
        const customerRes = await axios.post(
          `${API_BASE_URL}/auth/customer/firebase-login`,
          { firebaseToken }
        );

        if (customerRes.data.role === "CUSTOMER") {
          navigate("/customer/home", { replace: true });
          return;
        }
      } catch (err) {}

      // ❌ No account found
      alert("User not found. Please register first.");
      await auth.signOut();

    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset email sent");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <div style={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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
          Forgot password?
        </button>

        <button
          style={styles.loginBtn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "..." : "Continue"}
        </button>
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
};

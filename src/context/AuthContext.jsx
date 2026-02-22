import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [providerOnboardingCompleted, setProviderOnboardingCompleted] =
    useState(localStorage.getItem("provider_onboarding_completed") === "true");
  const [providerStatus, setProviderStatus] = useState(
    localStorage.getItem("provider_status") || "PENDING"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        const path = window.location.pathname;

        /* 🚫 IMPORTANT: Skip AuthContext for Admin Routes */
        if (path.startsWith("/admin")) {
          setLoading(false);
          return;
        }

        if (!firebaseUser) {
          localStorage.removeItem("provider_token");
          localStorage.removeItem("provider_onboarding_completed");
          localStorage.removeItem("provider_status");
          setUser(null);
          setRole(null);
          setProviderOnboardingCompleted(false);
          setProviderStatus("PENDING");
          setLoading(false);
          return;
        }

        setUser(firebaseUser);
        const firebaseToken = await firebaseUser.getIdToken();

        /* ===============================
           1️⃣ TRY PROVIDER LOGIN
        =============================== */
        try {
          const providerRes = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/provider/firebase-login`,
            { firebaseToken }
          );

          if (providerRes.data.role === "PROVIDER") {
            localStorage.setItem("provider_token", providerRes.data.token);
            const done = !!providerRes.data.provider?.onboardingCompleted;
            localStorage.setItem(
              "provider_onboarding_completed",
              done ? "true" : "false"
            );
            const status = providerRes.data.provider?.status || "PENDING";
            localStorage.setItem("provider_status", status);
            setProviderOnboardingCompleted(done);
            setProviderStatus(status);
            setRole("PROVIDER");
            setLoading(false);
            return;
          }
        } catch (err) {}

        /* ===============================
           2️⃣ TRY CUSTOMER LOGIN
        =============================== */
        try {
          const customerRes = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/customer/firebase-login`,
            { firebaseToken }
          );

          if (customerRes.data.role === "CUSTOMER") {
            setProviderOnboardingCompleted(false);
            setProviderStatus("PENDING");
            setRole("CUSTOMER");
            setLoading(false);
            return;
          }
        } catch (err) {}

        /* ===============================
           ❌ NO ACCOUNT FOUND (ONLY FOR /login)
        =============================== */
        if (path === "/login") {
          alert("User not found. Please register first.");
        }

        await signOut(auth);
        setUser(null);
        setRole(null);
        setProviderOnboardingCompleted(false);
        setProviderStatus("PENDING");
        setLoading(false);
      } catch (error) {
        console.error("Auth bootstrap failed:", error);
        setUser(null);
        setRole(null);
        setProviderOnboardingCompleted(false);
        setProviderStatus("PENDING");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        providerOnboardingCompleted,
        setProviderOnboardingCompleted,
        providerStatus,
        setProviderStatus,
        loading,
        isProvider: role === "PROVIDER",
        isCustomer: role === "CUSTOMER",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

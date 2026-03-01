import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import axios from "axios";

const AuthContext = createContext();
const ACTIVE_ROLE_KEY = "active_role";
const PROVIDER_TOKEN_KEY = "provider_token";
const PROVIDER_ONBOARDING_KEY = "provider_onboarding_completed";
const PROVIDER_STATUS_KEY = "provider_status";
const PROVIDER_PROFILE_KEY = "provider_profile";

const getSession = (key) => sessionStorage.getItem(key);
const setSession = (key, value) => sessionStorage.setItem(key, value);
const removeSession = (key) => sessionStorage.removeItem(key);
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

const clearProviderSession = () => {
  removeSession(PROVIDER_TOKEN_KEY);
  removeSession(PROVIDER_ONBOARDING_KEY);
  removeSession(PROVIDER_STATUS_KEY);
  removeSession(PROVIDER_PROFILE_KEY);
  removeSession(ACTIVE_ROLE_KEY);
};

const setActiveRole = (role) => {
  if (role) {
    setSession(ACTIVE_ROLE_KEY, role);
  } else {
    removeSession(ACTIVE_ROLE_KEY);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [providerProfile, setProviderProfile] = useState(() => {
    const raw = getSession(PROVIDER_PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [providerOnboardingCompleted, setProviderOnboardingCompleted] = useState(
    getSession(PROVIDER_ONBOARDING_KEY) === "true"
  );
  const [providerStatus, setProviderStatus] = useState(
    getSession(PROVIDER_STATUS_KEY) || "PENDING"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      try {
        const path = window.location.pathname;

        if (path.startsWith("/admin") || path.startsWith("/register")) {
          setLoading(false);
          return;
        }

        if (!firebaseUser) {
          clearProviderSession();
          setUser(null);
          setRole(null);
          setProviderProfile(null);
          setProviderOnboardingCompleted(false);
          setProviderStatus("PENDING");
          setLoading(false);
          return;
        }

        setUser(firebaseUser);
        const firebaseToken = await firebaseUser.getIdToken();
        const resolved = await postWithRetry(
          `${import.meta.env.VITE_API_BASE_URL}/auth/firebase-login`,
          { firebaseToken },
          { retries: 2, retryDelayMs: 450 }
        );

        const resolvedRole = resolved?.data?.role;

        if (resolvedRole === "CUSTOMER") {
          await postWithRetry(
            `${import.meta.env.VITE_API_BASE_URL}/auth/customer/firebase-login`,
            { firebaseToken },
            { retries: 2, retryDelayMs: 450 }
          );

          clearProviderSession();
          setProviderProfile(null);
          setProviderOnboardingCompleted(false);
          setProviderStatus("PENDING");
          setRole("CUSTOMER");
          setActiveRole("CUSTOMER");
          setLoading(false);
          return;
        }

        if (resolvedRole === "PROVIDER") {
          const providerRes = await postWithRetry(
            `${import.meta.env.VITE_API_BASE_URL}/auth/provider/firebase-login`,
            { firebaseToken },
            { retries: 3, retryDelayMs: 600 }
          );

          setSession(PROVIDER_TOKEN_KEY, providerRes.data.token);
          const provider = providerRes.data.provider || null;
          setSession(PROVIDER_PROFILE_KEY, JSON.stringify(provider || {}));
          setProviderProfile(provider);
          const done = !!providerRes.data.provider?.onboardingCompleted;
          const status = providerRes.data.provider?.status || "PENDING";
          setSession(PROVIDER_ONBOARDING_KEY, done ? "true" : "false");
          setSession(PROVIDER_STATUS_KEY, status);
          setProviderOnboardingCompleted(done);
          setProviderStatus(status);
          setRole("PROVIDER");
          setActiveRole("PROVIDER");
          setLoading(false);
          return;
        }

        await signOut(auth);
        clearProviderSession();
        setUser(null);
        setRole(null);
        setProviderProfile(null);
        setProviderOnboardingCompleted(false);
        setProviderStatus("PENDING");
      } catch (error) {
        console.error("Auth bootstrap failed:", error);
        clearProviderSession();
        setUser(null);
        setRole(null);
        setProviderProfile(null);
        setProviderOnboardingCompleted(false);
        setProviderStatus("PENDING");
      } finally {
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
        providerProfile,
        setProviderProfile: (profile) => {
          setProviderProfile(profile || null);
          if (profile) {
            setSession(PROVIDER_PROFILE_KEY, JSON.stringify(profile));
          } else {
            removeSession(PROVIDER_PROFILE_KEY);
          }
        },
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

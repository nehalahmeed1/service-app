import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next"; // ✅ FIX

export default function ProviderHeader() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { userData } = useAuth();
  const { language, setLanguage } = useLanguage(); // ❌ remove t from here
  const { t } = useTranslation(); // ✅ correct source of t

  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

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
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "Provider";
  };

  const getInitial = () => getName().charAt(0).toUpperCase();

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b bg-white sticky top-0 z-40">
      <h3 className="font-semibold text-base">ServiceConnect</h3>

      <div className="flex items-center gap-4">
        {/* 🌐 Global Language Switcher */}
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => setLanguage("en")}
            className={`px-2 py-1 rounded ${
              language === "en"
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            EN
          </button>

          <button
            onClick={() => setLanguage("hi")}
            className={`px-2 py-1 rounded ${
              language === "hi"
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            हिंदी
          </button>

          <button
            onClick={() => setLanguage("te")}
            className={`px-2 py-1 rounded ${
              language === "te"
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            తెలుగు
          </button>
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

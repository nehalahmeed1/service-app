import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth } from "@/firebase";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { t } = useTranslation();
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
    return "User";
  };

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b bg-white sticky top-0 z-40">
      <h3 className="font-semibold text-base">{t("appName")}</h3>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        {user && (
          <div ref={menuRef} className="relative flex items-center gap-2">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold"
            >
              {getName().charAt(0).toUpperCase()}
            </button>

            <span className="hidden md:inline text-sm text-gray-700">
              {t("hi")}, {getName()}
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

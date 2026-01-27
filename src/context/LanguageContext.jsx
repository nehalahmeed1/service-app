import { createContext, useContext, useEffect, useState } from "react";
import i18n from "@/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("app_language") || "en";
  });

  const setLanguage = (lang) => {
    if (i18n.language === lang) return; // prevent useless re-render
    localStorage.setItem("app_language", lang);
    setLanguageState(lang);
    i18n.changeLanguage(lang); // 🔥 triggers react-i18next update
  };

  useEffect(() => {
    // Initial sync on app load
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

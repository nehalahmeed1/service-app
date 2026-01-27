import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("appLanguage", lang);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-2 py-1 text-xs rounded ${
          i18n.language === "en"
            ? "bg-primary text-white"
            : "bg-muted"
        }`}
      >
        EN
      </button>

      <button
        onClick={() => changeLanguage("hi")}
        className={`px-2 py-1 text-xs rounded ${
          i18n.language === "hi"
            ? "bg-primary text-white"
            : "bg-muted"
        }`}
      >
        हिंदी
      </button>

      <button
        onClick={() => changeLanguage("te")}
        className={`px-2 py-1 text-xs rounded ${
          i18n.language === "te"
            ? "bg-primary text-white"
            : "bg-muted"
        }`}
      >
        తెలుగు
      </button>
    </div>
  );
};

export default LanguageSwitcher;

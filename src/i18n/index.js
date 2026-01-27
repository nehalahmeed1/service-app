import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import te from "./locales/te.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
};

i18n.use(initReactI18next).init({
  resources,

  lng: "en", // neutral boot language

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
    bindI18n: "languageChanged", // 🔥 FORCE react re-render on change
  },
});

export default i18n;

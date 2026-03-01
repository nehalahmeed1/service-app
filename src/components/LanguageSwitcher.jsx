import { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher({ enabled = true }) {
  const { language, setLanguage } = useLanguage();
  const isEnabled = useMemo(() => {
    const flag = localStorage.getItem("multilang_enabled");
    if (flag === "false") return false;
    return enabled;
  }, [enabled]);

  if (!isEnabled) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 text-xs rounded ${
          language === "en" ? "bg-primary text-white" : "bg-muted"
        }`}
      >
        EN
      </button>

      <button
        onClick={() => setLanguage("hi")}
        className={`px-2 py-1 text-xs rounded ${
          language === "hi" ? "bg-primary text-white" : "bg-muted"
        }`}
      >
        हिंदी
      </button>

      <button
        onClick={() => setLanguage("te")}
        className={`px-2 py-1 text-xs rounded ${
          language === "te" ? "bg-primary text-white" : "bg-muted"
        }`}
      >
        తెలుగు
      </button>
    </div>
  );
}

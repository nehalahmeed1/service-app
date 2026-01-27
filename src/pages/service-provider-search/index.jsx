import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";

export default function ServiceProviderSearch() {
  const navigate = useNavigate();

  const { language } = useLanguage();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const [search, setSearch] = useState("");

  const providers = [
    { id: 1, name: "Rahul Electrician", service: "Electrician" },
    { id: 2, name: "Amit Plumber", service: "Plumber" },
  ];

  const filtered = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          {t("find_service_providers")}
        </h1>

        <input
          placeholder={t("search_services")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <div style={styles.grid}>
          {filtered.map((provider) => (
            <div
              key={provider.id}
              style={styles.card}
              onClick={() =>
                navigate(`/customer/provider/${provider.id}`)
              }
            >
              <div style={styles.avatar}>
                {provider.name.charAt(0)}
              </div>

              <div>
                <h3 style={styles.name}>{provider.name}</h3>
                <p style={styles.service}>{provider.service}</p>
              </div>
            </div>
          ))}
        </div>

        {!filtered.length && (
          <p style={styles.empty}>
            {t("no_providers_found")}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "40px 16px",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
  },

  title: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 20,
  },

  search: {
    width: "100%",
    maxWidth: 420,
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    marginBottom: 30,
    fontSize: 15,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 20,
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    display: "flex",
    gap: 14,
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: 18,
  },

  name: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
  },

  service: {
    margin: 0,
    fontSize: 14,
    color: "#6b7280",
  },

  empty: {
    marginTop: 40,
    textAlign: "center",
    color: "#6b7280",
  },
};

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { fetchPublicSubCategories } from "@/services/categoryService";

const STORAGE_KEY = "providerServices";

export default function ProviderServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        const subCategories = await fetchPublicSubCategories();

        const mapped = (Array.isArray(subCategories) ? subCategories : []).map(
          (sub) => ({
            id: sub._id,
            name: sub.name,
            categoryName: sub.category_id?.name || "",
            price: stored?.[sub._id]?.price || "",
            active: Boolean(stored?.[sub._id]?.active),
          })
        );

        setServices(mapped);
      } catch (err) {
        console.error("Failed to load provider services", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const toggleService = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const updatePrice = (id, price) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, price } : s)));
  };

  const saveServices = () => {
    const payload = services.reduce((acc, item) => {
      acc[item.id] = {
        name: item.name,
        categoryName: item.categoryName,
        active: item.active,
        price: item.price,
      };
      return acc;
    }, {});

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    alert(t("services_updated_successfully"));
  };

  return (
    <>
      <Helmet>
        <title>{t("my_services")} - {t("provider")}</title>
      </Helmet>

      <div className="bg-background">
        <main>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t("my_services_pricing")}</h1>
            <p className="text-muted-foreground">{t("my_services_pricing_subtitle")}</p>
          </div>

          {loading ? (
            <div className="max-w-6xl rounded-xl border bg-card p-5 text-sm text-muted-foreground">
              Loading services...
            </div>
          ) : (
            <div className="max-w-6xl space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-card border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={service.active}
                      onChange={() => toggleService(service.id)}
                      className="w-5 h-5"
                    />

                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.categoryName} · {t("visible_to_customers")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{t("price_rs")}</span>
                    <input
                      type="number"
                      placeholder={t("enter_price")}
                      value={service.price}
                      onChange={(e) => updatePrice(service.id, e.target.value)}
                      disabled={!service.active}
                      className="border rounded-lg px-3 py-2 w-28 disabled:opacity-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-6xl mt-8">
            <button
              onClick={saveServices}
              className="bg-primary text-white px-10 py-3 rounded-lg font-semibold"
            >
              {t("save_services")}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

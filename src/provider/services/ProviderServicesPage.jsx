import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import providerApi from "@/services/providerApi";
import {
  fetchPublicCategories,
  fetchPublicSubCategories,
} from "@/services/categoryService";

export default function ProviderServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const [profileRes, onboardingRes, categoriesData, subCategoriesData] =
          await Promise.all([
            providerApi.get("/provider/me"),
            providerApi.get("/provider/onboarding/status"),
            fetchPublicCategories(),
            fetchPublicSubCategories(),
          ]);

        const profile = profileRes?.data?.data || {};
        const onboarding = onboardingRes?.data?.data || {};
        const workSection =
          onboarding?.sections?.find((section) => section.key === "work")
            ?.data || {};

        const categories = Array.isArray(categoriesData) ? categoriesData : [];
        const subCategories = Array.isArray(subCategoriesData)
          ? subCategoriesData
          : [];

        const categoryMap = new Map(
          categories.map((cat) => [String(cat._id), cat])
        );
        const subCategoryMap = new Map(
          subCategories.map((sub) => [String(sub._id), sub])
        );

        const selectedServices = new Map();

        const addSubCategory = (
          subCategoryId,
          fallbackName = "",
          fallbackCategoryName = ""
        ) => {
          if (!subCategoryId) return;
          const key = `sub:${subCategoryId}`;
          if (selectedServices.has(key)) return;

          const sub = subCategoryMap.get(String(subCategoryId));
          selectedServices.set(key, {
            key,
            name: sub?.name || fallbackName || "Service",
            categoryName: sub?.category_id?.name || fallbackCategoryName || "",
            basePrice: Number(sub?.basePrice || 0),
          });
        };

        const addCategoryOnly = (categoryId, fallbackName = "") => {
          if (!categoryId) return;
          const key = `cat:${categoryId}`;
          if (selectedServices.has(key)) return;

          const category = categoryMap.get(String(categoryId));
          selectedServices.set(key, {
            key,
            name: fallbackName || category?.name || "Service Category",
            categoryName: category?.name || "",
            basePrice: 0,
          });
        };

        const profileSubCategoryIds = Array.isArray(profile?.serviceSubCategoryIds)
          ? profile.serviceSubCategoryIds
          : profile?.serviceSubCategoryId
          ? [profile.serviceSubCategoryId]
          : [];

        profileSubCategoryIds.forEach((subCategoryId, index) => {
          addSubCategory(
            subCategoryId,
            Array.isArray(profile?.serviceSubCategoryNames)
              ? profile.serviceSubCategoryNames[index] || ""
              : profile?.serviceSubCategoryName || "",
            profile?.serviceCategoryName
          );
        });

        if (profileSubCategoryIds.length === 0) {
          addCategoryOnly(profile?.serviceCategoryId, profile?.serviceCategoryName);
        }

        addSubCategory(workSection?.subCategoryId);
        if (!workSection?.subCategoryId) {
          addCategoryOnly(workSection?.categoryId);
        }

        setServices(Array.from(selectedServices.values()));
      } catch (err) {
        console.error("Failed to load provider services", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("my_services")} - {t("provider")}</title>
      </Helmet>

      <div className="bg-background">
        <main>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t("my_services")}</h1>
            <p className="text-muted-foreground">
              Services selected in your profile and onboarding.
            </p>
          </div>

          {loading ? (
            <div className="max-w-6xl rounded-xl border bg-card p-5 text-sm text-muted-foreground">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="max-w-6xl rounded-xl border bg-card p-5 text-sm text-muted-foreground">
              No selected services found. Update your provider profile to add services.
            </div>
          ) : (
            <div className="max-w-6xl space-y-4">
              {services.map((service) => (
                <div
                  key={service.key}
                  className="bg-card border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.categoryName || "-"} - {t("visible_to_customers")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{t("price_rs")}</span>
                    <div className="border rounded-lg px-3 py-2 min-w-28 text-right text-sm bg-muted/40">
                      {service.basePrice > 0
                        ? service.basePrice.toLocaleString()
                        : "Not set by admin"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

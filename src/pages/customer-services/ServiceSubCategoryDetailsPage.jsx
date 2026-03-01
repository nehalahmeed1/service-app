import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/components/AppIcon";
import { useAuth } from "@/context/AuthContext";
import { translateEntity } from "@/utils/i18nEntity";
import {
  fetchPublicCategories,
  fetchPublicSubCategories,
} from "@/services/categoryService";

const HIGHLIGHT_KEYS = [
  "highlight_background_verified_professionals",
  "highlight_tools_and_essentials_included",
  "highlight_service_warranty_included",
  "highlight_free_reschedule_before_slot",
];

function getServiceMeta(subName) {
  const base = (subName?.length || 8) * 3;
  return {
    priceFrom: 199 + (base % 10) * 100,
    duration: 45 + (base % 5) * 15,
    rating: (4.2 + (base % 8) * 0.1).toFixed(1),
    completed: 120 + (base % 50) * 7,
  };
}

export default function ServiceSubCategoryDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { serviceSlug, subSlug } = useParams();
  const { user } = useAuth();
  const [categoryName, setCategoryName] = useState(t("services"));
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const categories = await fetchPublicCategories();
        const category = (Array.isArray(categories) ? categories : []).find(
          (c) => c.slug === serviceSlug || c._id === serviceSlug
        );

        if (!category?._id) {
          setError(t("category_not_found"));
          setService(null);
          return;
        }

        setCategoryName(translateEntity(t, "category_name", category, category.name));
        const subCategories = await fetchPublicSubCategories({
          categoryId: category._id,
        });

        const selected = (Array.isArray(subCategories) ? subCategories : []).find(
          (s) => s.slug === subSlug || s._id === subSlug
        );

        if (!selected) {
          setError(t("service_details_not_found"));
          setService(null);
          return;
        }

        setService(selected);
      } catch (err) {
        console.error("Failed to load service details", err);
        setError(t("failed_load_service_details"));
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [serviceSlug, subSlug, t]);

  const meta = useMemo(
    () => getServiceMeta(service?.name || ""),
    [service?.name]
  );

  return (
    <>
      <Helmet>
        <title>{service?.name || t("service_details")}</title>
      </Helmet>

      <div className="mx-auto max-w-6xl pb-10 space-y-5">
        <section className="rounded-2xl border bg-white p-5">
          <button
            onClick={() => navigate(`/customer/services/${serviceSlug}`)}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <Icon name="ArrowLeft" size={14} />
            {t("back_to_sub_categories")}
          </button>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            {loading
              ? t("loading")
              : translateEntity(t, "subcategory_name", service, service?.name)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{categoryName}</p>
        </section>

        {error ? (
          <section className="rounded-2xl border bg-white p-5 text-sm text-red-600">
            {error}
          </section>
        ) : null}

        {!loading && service ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl border bg-white p-5 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label={t("starts_at")} value={`Rs ${meta.priceFrom}`} />
                <Stat label={t("duration")} value={`${meta.duration} ${t("mins")}`} />
                <Stat label={t("rating")} value={meta.rating} />
                <Stat label={t("bookings")} value={`${meta.completed}+`} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t("what_you_get")}</h2>
                <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
                  {HIGHLIGHT_KEYS.map((item) => (
                    <li key={item} className="inline-flex items-start gap-2 rounded-md border bg-slate-50 px-3 py-2">
                      <Icon name="Check" size={14} className="mt-0.5 text-emerald-600" />
                      <span>{t(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t("service_flow")}</h2>
                <ol className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="inline-flex gap-2"><span className="font-semibold">1.</span>{t("service_flow_step_1")}</li>
                  <li className="inline-flex gap-2"><span className="font-semibold">2.</span>{t("service_flow_step_2")}</li>
                  <li className="inline-flex gap-2"><span className="font-semibold">3.</span>{t("service_flow_step_3")}</li>
                  <li className="inline-flex gap-2"><span className="font-semibold">4.</span>{t("service_flow_step_4")}</li>
                </ol>
              </div>
            </section>

            <aside className="rounded-2xl border bg-white p-5 h-fit">
              <h3 className="text-xl font-semibold text-slate-900">
                {translateEntity(t, "subcategory_name", service, service.name)}
              </h3>
              <p className="text-sm text-slate-500 mt-1">/{service.slug}</p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t("starting_price")}</span>
                  <span className="font-semibold text-slate-900">Rs {meta.priceFrom}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t("estimated_duration")}</span>
                  <span className="font-semibold text-slate-900">{meta.duration} {t("mins")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t("support")}</span>
                  <span className="font-semibold text-slate-900">24x7</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const target = `/customer/services/${serviceSlug}/book?package=${service._id}`;
                  if (!user) {
                    navigate("/login", {
                      state: { redirectTo: target, source: "book_now" },
                    });
                    return;
                  }
                  navigate(target);
                }}
                className="mt-5 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white"
              >
                {t("bookNow")}
              </button>
            </aside>
          </div>
        ) : null}
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

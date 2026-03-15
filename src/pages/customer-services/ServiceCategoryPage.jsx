import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/components/AppIcon";
import { useAuth } from "@/context/AuthContext";
import { translateEntity } from "@/utils/i18nEntity";
import { getServiceImageUrl, getServiceFallbackSvg } from "@/utils/serviceImages";
import {
  fetchPublicCategories,
  fetchPublicSubCategories,
} from "@/services/categoryService";

const CITY_NAME = "Mancherial";
const ICONS = ["Wrench", "Hammer", "Fan", "Sparkles", "PaintBucket", "ShieldCheck", "Droplets", "Scissors"];
const HIGHLIGHT_KEYS = [
  "highlight_background_verified_professionals",
  "highlight_tools_and_essentials_included",
  "highlight_service_warranty_included",
  "highlight_free_reschedule_before_slot",
];

const CARD_IMAGE_FALLBACK = getServiceFallbackSvg("Service");

function getServiceMeta(sub, index) {
  const base = (sub?.name?.length || 8) + index * 3;
  const priceFrom = Number(sub?.basePrice || 0) || 199 + (base % 10) * 100;
  const duration = 45 + (base % 5) * 15;
  const rating = (4.2 + (base % 8) * 0.1).toFixed(1);
  const completed = 120 + (base % 50) * 7;
  const badge = base % 2 === 0 ? "Most Booked" : "Quick Service";
  return {
    priceFrom,
    duration,
    rating,
    completed,
    badge,
    highlights: [
      HIGHLIGHT_KEYS[index % HIGHLIGHT_KEYS.length],
      HIGHLIGHT_KEYS[(index + 1) % HIGHLIGHT_KEYS.length],
    ],
  };
}

export default function ServiceCategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { serviceSlug } = useParams();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const categoryData = await fetchPublicCategories();
        const categoryList = Array.isArray(categoryData) ? categoryData : [];
        setCategories(categoryList);

        const selectedCategory =
          categoryList.find((c) => c.slug === serviceSlug) ||
          categoryList.find((c) => c._id === serviceSlug);

        if (!selectedCategory?._id) {
          setSubCategories([]);
          return;
        }

        const subData = await fetchPublicSubCategories({
          categoryId: selectedCategory._id,
        });
        setSubCategories(Array.isArray(subData) ? subData : []);
      } catch (err) {
        console.error("Failed to load category page data", err);
        setError(t("failed_to_load_services"));
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [serviceSlug, t]);

  const categoryName = useMemo(() => {
    const match =
      categories.find((c) => c.slug === serviceSlug) ||
      categories.find((c) => c._id === serviceSlug);
    return match
      ? translateEntity(t, "category_name", match, match.name)
      : t("services");
  }, [categories, serviceSlug, t]);

  return (
    <>
      <Helmet>
        <title>{categoryName} - {CITY_NAME}</title>
      </Helmet>

      <div className="mx-auto max-w-7xl space-y-5 pb-10">
        <section className="rounded-2xl border bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-700">{CITY_NAME} services</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">{categoryName}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("select_sub_category")}</p>

          {!loading && !error && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge icon="Layers3" label={`${subCategories.length} options`} />
              <Badge icon="ShieldCheck" label={t("verified_professionals")} color="emerald" />
              <Badge icon="Clock3" label={t("same_day_slots")} color="indigo" />
            </div>
          )}
        </section>

        {loading ? (
          <section className="rounded-xl border bg-white p-5 text-sm text-slate-500">{t("loading_services")}</section>
        ) : error ? (
          <section className="rounded-xl border bg-white p-5 text-sm text-red-600">{error}</section>
        ) : subCategories.length === 0 ? (
          <section className="rounded-xl border bg-white p-5 text-sm text-slate-500">{t("no_sub_categories_found")}</section>
        ) : (
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {subCategories.map((sub, index) => {
              const meta = getServiceMeta(sub, index);
              return (
                <article key={sub._id} className="rounded-xl border bg-white p-4">
                  <img
                    src={getServiceImageUrl({
                      name: sub.name,
                      categoryName,
                      businessLevel: sub.businessLevel || "INDIVIDUAL",
                    })}
                    alt={sub.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = CARD_IMAGE_FALLBACK;
                    }}
                    className="h-40 w-full rounded-xl object-cover"
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                      <Icon name={ICONS[index % ICONS.length]} size={18} />
                    </div>
                    <span className="mt-3 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                      {meta.badge === "Most Booked" ? t("most_booked") : t("quick_service")}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-semibold text-slate-900">
                    {translateEntity(t, "subcategory_name", sub, sub.name)}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">Service in {CITY_NAME}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <Info label={t("starts_at")} value={`Rs ${meta.priceFrom}`} />
                    <Info label={t("duration")} value={`${meta.duration} ${t("mins")}`} />
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-700">
                      <Icon name="Star" size={13} className="text-amber-500" />
                      {meta.rating}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600">{meta.completed}+ {t("bookings")}</span>
                  </div>

                  <ul className="mt-3 space-y-1 text-xs text-slate-600">
                    {meta.highlights.map((item, itemIndex) => (
                      <li key={`${sub._id}-${itemIndex}`} className="flex items-start gap-1.5">
                        <Icon name="Check" size={12} className="mt-0.5 text-emerald-600" />
                        <span>{t(item)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        const target = `/customer/services/${serviceSlug}/book?package=${sub._id}`;
                        if (!user) {
                          navigate("/login", { state: { redirectTo: target, source: "book_now" } });
                          return;
                        }
                        navigate(target);
                      }}
                      className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
                    >
                      {t("bookNow")}
                    </button>
                    <button
                      onClick={() => navigate(`/customer/services/${serviceSlug}/details/${sub.slug || sub._id}`)}
                      className="h-10 rounded-lg border px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {t("view_details")}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}

function Badge({ icon, label, color = "slate" }) {
  const colorClasses =
    color === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : color === "indigo"
      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
      : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${colorClasses}`}>
      <Icon name={icon} size={13} />
      {label}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border bg-slate-50 px-2 py-2">
      <p className="text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

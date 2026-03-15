import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/components/AppIcon";
import { fetchPublicCategories } from "@/services/categoryService";
import { translateEntity } from "@/utils/i18nEntity";
import { useAuth } from "@/context/AuthContext";
import { getServiceImageUrl, getServiceFallbackSvg } from "@/utils/serviceImages";

const CITY_NAME = "Mancherial";
const TAG_ALIASES = {
  "House Cleaning": ["home cleaning", "cleaning", "housekeeping"],
  Electrician: ["electrical", "electric", "wiring"],
  Plumber: ["plumbing", "plumber", "pipe"],
  "AC Service": ["ac", "air condition", "hvac", "cooling"],
};

const BUSINESS_LEVEL_META = {
  INDIVIDUAL: {
    titleKey: "home_level_card_individual_title",
    subtitleKey: "home_level_card_individual_subtitle",
    badgeKey: "home_level_card_individual_badge",
    tone: "from-sky-50 to-cyan-50 border-sky-200",
  },
  SMALL_TEAM: {
    titleKey: "home_level_card_small_team_title",
    subtitleKey: "home_level_card_small_team_subtitle",
    badgeKey: "home_level_card_small_team_badge",
    tone: "from-amber-50 to-orange-50 border-amber-200",
  },
  ENTERPRISE: {
    titleKey: "home_level_card_enterprise_title",
    subtitleKey: "home_level_card_enterprise_subtitle",
    badgeKey: "home_level_card_enterprise_badge",
    tone: "from-violet-50 to-indigo-50 border-violet-200",
  },
};
const BUSINESS_LEVEL_ORDER = ["INDIVIDUAL", "SMALL_TEAM", "ENTERPRISE"];
const BUSINESS_LEVEL_EXPERIENCE = {
  INDIVIDUAL: {
    labelKey: "home_level_tab_individual",
    headlineKey: "home_level_experience_individual_headline",
    sublineKey: "home_level_experience_individual_subline",
    ctaKey: "home_level_experience_individual_cta",
    pointsKeys: [
      "home_level_experience_individual_point_1",
      "home_level_experience_individual_point_2",
      "home_level_experience_individual_point_3",
    ],
    stepsKeys: [
      "home_level_step_choose_service",
      "home_level_step_pick_slot",
      "home_level_step_track_and_pay",
    ],
    tone: "from-cyan-50 to-sky-50 border-cyan-200",
  },
  SMALL_TEAM: {
    labelKey: "home_level_tab_small_team",
    headlineKey: "home_level_experience_small_team_headline",
    sublineKey: "home_level_experience_small_team_subline",
    ctaKey: "home_level_experience_small_team_cta",
    pointsKeys: [
      "home_level_experience_small_team_point_1",
      "home_level_experience_small_team_point_2",
      "home_level_experience_small_team_point_3",
    ],
    stepsKeys: [
      "home_level_step_define_scope",
      "home_level_step_set_schedule",
      "home_level_step_monitor_completion",
    ],
    tone: "from-amber-50 to-orange-50 border-amber-200",
  },
  ENTERPRISE: {
    labelKey: "home_level_tab_enterprise",
    headlineKey: "home_level_experience_enterprise_headline",
    sublineKey: "home_level_experience_enterprise_subline",
    ctaKey: "home_level_experience_enterprise_cta",
    pointsKeys: [
      "home_level_experience_enterprise_point_1",
      "home_level_experience_enterprise_point_2",
      "home_level_experience_enterprise_point_3",
    ],
    stepsKeys: [
      "home_level_step_onboard_locations",
      "home_level_step_set_sla",
      "home_level_step_review_audits",
    ],
    tone: "from-violet-50 to-indigo-50 border-violet-200",
  },
};

const IMAGE_FALLBACK = getServiceFallbackSvg("ServiceConnect");

function getServiceVisual(name = "") {
  const lower = String(name).toLowerCase();
  if (lower.includes("plumb") || lower.includes("leak")) {
    return { icon: "Droplets", chip: "bg-cyan-600", emoji: "🚰" };
  }
  if (lower.includes("bath")) {
    return { icon: "Bath", chip: "bg-sky-600", emoji: "🛁" };
  }
  if (lower.includes("clean")) {
    return { icon: "Sparkles", chip: "bg-emerald-600", emoji: "🧼" };
  }
  if (lower.includes("electric") || lower.includes("wiring")) {
    return { icon: "Zap", chip: "bg-amber-500", emoji: "⚡" };
  }
  if (lower.includes("gas") || lower.includes("stove")) {
    return { icon: "Flame", chip: "bg-orange-600", emoji: "🔥" };
  }
  if (lower.includes("ac") || lower.includes("air") || lower.includes("fan")) {
    return { icon: "Wind", chip: "bg-blue-600", emoji: "❄️" };
  }
  if (lower.includes("lock") || lower.includes("door")) {
    return { icon: "Lock", chip: "bg-slate-700", emoji: "🔒" };
  }
  if (lower.includes("tv") || lower.includes("appliance")) {
    return { icon: "Tv", chip: "bg-purple-600", emoji: "📺" };
  }
  if (lower.includes("pest") || lower.includes("termite")) {
    return { icon: "Bug", chip: "bg-lime-700", emoji: "🐜" };
  }
  return { icon: "Wrench", chip: "bg-indigo-600", emoji: "🛠️" };
}

function getSemanticFallbackImage(name = "") {
  const visual = getServiceVisual(name);
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'>" +
        "<defs><linearGradient id='bg' x1='0' x2='1' y1='0' y2='1'>" +
        "<stop stop-color='#1e293b' offset='0'/>" +
        "<stop stop-color='#0f766e' offset='1'/>" +
        "</linearGradient></defs>" +
        "<rect width='900' height='600' fill='url(#bg)'/>" +
        `<text x='50%' y='44%' fill='white' font-size='120' text-anchor='middle' font-family='Segoe UI Emoji, Apple Color Emoji, Arial'>${visual.emoji}</text>` +
        `<text x='50%' y='58%' fill='white' font-size='34' text-anchor='middle' font-family='Arial, sans-serif'>${name || "Home Service"}</text>` +
      "</svg>"
    )
  );
}

function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
}

function getServiceImage(service) {
  return getServiceImageUrl({
    name: service?.name || "",
    categoryName: service?.categoryName || "",
    businessLevel: service?.businessLevel || "INDIVIDUAL",
  });
}

function getPromoImage(item) {
  return getServiceImageUrl({
    name: item?.name || "",
    categoryName: item?.categoryName || "",
    businessLevel: item?.businessLevel || "INDIVIDUAL",
  });
}

function getBackupImageForService(serviceName = "") {
  return getServiceImageUrl({ name: serviceName });
}

function formatPrice(value) {
  const amount = Number(value || 0);
  return amount > 0 ? `Rs ${amount.toLocaleString()}` : "From Rs 199";
}

export default function ServiceProviderSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const query = new URLSearchParams(location.search).get("q") || "";
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [stats, setStats] = useState({
    avgRating: 4.7,
    totalJobsDone: 0,
    jobsDoneToday: 0,
  });
  const [sections, setSections] = useState([]);
  const [mostBooked, setMostBooked] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [selectedBusinessLevel, setSelectedBusinessLevel] = useState("INDIVIDUAL");
  const cityName = t("home_city_name", { defaultValue: CITY_NAME });
  const quickTags = useMemo(
    () => [
      { key: "House Cleaning", label: t("home_quick_tag_house_cleaning") },
      { key: "Electrician", label: t("home_quick_tag_electrician") },
      { key: "Plumber", label: t("home_quick_tag_plumber") },
      { key: "AC Service", label: t("home_quick_tag_ac_service") },
    ],
    [t]
  );
  
  useEffect(() => {
    document.title = `${t("appName")} - ${cityName}`;
  }, [t, cityName]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchPublicCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load public categories", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${getApiBase()}/public/marketplace/stats`);
        const data = await res.json();
        if (data?.success && data?.data) {
          setStats({
            avgRating: Number(data.data.avgRating || 4.7),
            totalJobsDone: Number(data.data.totalJobsDone || 0),
            jobsDoneToday: Number(data.data.jobsDoneToday || 0),
          });
        }
      } catch (error) {
        console.error("Failed to load marketplace stats", error);
      }
    };

    const loadHomeSections = async () => {
      try {
        setLoadingSections(true);
        const res = await fetch(`${getApiBase()}/public/marketplace/home-data`);
        const data = await res.json();
        if (data?.success && data?.data) {
          setSections(Array.isArray(data.data.sections) ? data.data.sections : []);
          setMostBooked(Array.isArray(data.data.mostBooked) ? data.data.mostBooked : []);
        }
      } catch (error) {
        console.error("Failed to load marketplace sections", error);
        setSections([]);
        setMostBooked([]);
      } finally {
        setLoadingSections(false);
      }
    };

    loadStats();
    loadHomeSections();
  }, []);

  const getCategoryByTag = (tag) => {
    const aliases = TAG_ALIASES[tag] || [tag.toLowerCase()];
    return categories.find((cat) => {
      const haystack = `${cat?.name || ""} ${cat?.slug || ""}`.toLowerCase();
      return aliases.some((alias) => haystack.includes(alias));
    });
  };

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((item) =>
      `${item?.name || ""} ${item?.slug || ""}`.toLowerCase().includes(q)
    );
  }, [categories, query]);

  const categoriesByBusinessLevel = useMemo(() => {
    return BUSINESS_LEVEL_ORDER
      .map((level) => {
        const items = filteredCategories
          .filter((item) => (item?.businessLevel || "INDIVIDUAL") === level)
          .slice(0, 8);
        return {
          level,
          meta: BUSINESS_LEVEL_META[level],
          items,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [filteredCategories]);
  const categoriesForSelectedLevel = useMemo(
    () =>
      filteredCategories.filter(
        (item) => (item?.businessLevel || "INDIVIDUAL") === selectedBusinessLevel
      ),
    [filteredCategories, selectedBusinessLevel]
  );
  const sectionsForSelectedLevel = useMemo(
    () =>
      sections.filter(
        (section) => (section?.businessLevel || "INDIVIDUAL") === selectedBusinessLevel
      ),
    [sections, selectedBusinessLevel]
  );
  const mostBookedForSelectedLevel = useMemo(
    () =>
      mostBooked.filter(
        (item) => (item?.businessLevel || "INDIVIDUAL") === selectedBusinessLevel
      ),
    [mostBooked, selectedBusinessLevel]
  );
  const availableLevels = useMemo(
    () =>
      BUSINESS_LEVEL_ORDER.filter((level) =>
        categories.some((item) => (item?.businessLevel || "INDIVIDUAL") === level)
      ),
    [categories]
  );

  useEffect(() => {
    if (!availableLevels.length) return;
    if (!availableLevels.includes(selectedBusinessLevel)) {
      setSelectedBusinessLevel(availableLevels[0]);
    }
  }, [availableLevels, selectedBusinessLevel]);

  const topCategories = (categoriesForSelectedLevel.length
    ? categoriesForSelectedLevel
    : filteredCategories
  ).slice(0, 10);
  const scopedMostBooked = mostBookedForSelectedLevel.length
    ? mostBookedForSelectedLevel
    : mostBooked;
  const promoPrimary = scopedMostBooked[0] || null;
  const promoCards = scopedMostBooked.slice(1, 4);
  const levelExperience = BUSINESS_LEVEL_EXPERIENCE[selectedBusinessLevel];

  const bookService = (item) => {
    const target = `/customer/services/${item.categorySlug || item.categoryId}/book?package=${item.id}`;
    if (!user) {
      navigate("/login", {
        state: { redirectTo: target, source: "book_now" },
      });
      return;
    }
    navigate(target);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-800 text-white">
          <div className="grid grid-cols-1 gap-5 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium">
                <Icon name="MapPin" size={14} />
                {t("home_trusted_services_in_city", { city: cityName })}
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
                {t("home_hero_title")}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-lg">
                {t("home_hero_subtitle", { city: cityName })}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {quickTags.map((tag) => (
                  <button
                    key={tag.key}
                    onClick={() => {
                      const match = getCategoryByTag(tag.key);
                      if (match?._id) {
                        navigate(`/customer/services/${match.slug || match._id}`);
                        return;
                      }
                      navigate(`/customer/home?q=${encodeURIComponent(tag.key)}`);
                    }}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                <Metric title={`${stats.avgRating.toFixed(1)}/5`} subtitle={t("home_metric_avg_rating")} />
                <Metric
                  title={`${stats.totalJobsDone.toLocaleString()}+`}
                  subtitle={t("home_metric_jobs_done_today", { today: stats.jobsDoneToday })}
                />
                <Metric title={t("home_metric_same_day_title")} subtitle={t("home_metric_available_slots")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <img
                src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80"
                alt="Home service"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.dataset.fallbackApplied === "1") {
                    target.onerror = null;
                    target.src = IMAGE_FALLBACK;
                    return;
                  }
                  target.dataset.fallbackApplied = "1";
                  target.src = getBackupImageForService("home service");
                }}
                className="h-40 w-full rounded-2xl object-cover sm:h-56"
              />
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
                alt="Repair service"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.dataset.fallbackApplied === "1") {
                    target.onerror = null;
                    target.src = IMAGE_FALLBACK;
                    return;
                  }
                  target.dataset.fallbackApplied = "1";
                  target.src = getBackupImageForService("ac service");
                }}
                className="h-40 w-full rounded-2xl object-cover sm:h-56"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{t("home_service_journey_title")}</h2>
              <p className="text-sm text-slate-600">
                {t("home_service_journey_subtitle")}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {BUSINESS_LEVEL_ORDER.map((level) => {
              const active = selectedBusinessLevel === level;
              const disabled = !availableLevels.includes(level);
              return (
                <button
                  key={level}
                  disabled={disabled}
                  onClick={() => setSelectedBusinessLevel(level)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
                >
                  {t(BUSINESS_LEVEL_EXPERIENCE[level].labelKey)}
                </button>
              );
            })}
          </div>

          <div
            className={`mt-4 grid grid-cols-1 gap-4 rounded-2xl border bg-gradient-to-br p-4 sm:p-5 lg:grid-cols-[1.2fr_0.8fr] ${
              levelExperience?.tone || "from-slate-50 to-white border-slate-200"
            }`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t(levelExperience?.labelKey || "", { defaultValue: selectedBusinessLevel })}
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                {t(levelExperience?.headlineKey || "")}
              </h3>
              <p className="mt-2 text-sm text-slate-700">{t(levelExperience?.sublineKey || "")}</p>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(levelExperience?.pointsKeys || []).map((point) => (
                  <p key={point} className="rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700">
                    {t(point)}
                  </p>
                ))}
              </div>

              <button
                onClick={() => navigate("/customer/home")}
                className="mt-4 h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              >
                {t(levelExperience?.ctaKey || "")}
              </button>
            </div>

            <div className="rounded-xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-900">{t("home_how_it_works")}</p>
              <div className="mt-3 space-y-2">
                {(levelExperience?.stepsKeys || []).map((step, idx) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-700">{t(step)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {t("home_active_catalog_count", { count: topCategories.length })}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{t("home_popular_categories_in_city", { city: cityName })}</h2>
              <p className="text-sm text-slate-600">
                {t("home_popular_categories_subtitle")}
              </p>
            </div>
            <p className="text-xs text-slate-500">{t("home_category_count", { count: topCategories.length })}</p>
          </div>

          {loadingCategories ? (
            <p className="mt-4 text-sm text-slate-500">{t("loading_categories")}</p>
          ) : topCategories.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">{t("home_no_matching_services")}</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {topCategories.map((item) => (
                <button
                  key={item._id}
                  onClick={() => navigate(`/customer/services/${item.slug || item._id}`)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {translateEntity(t, "category_name", item, item.name)}
                </button>
              ))}
            </div>
          )}
        </section>

        {categoriesByBusinessLevel.length > 0 ? (
          <section className="rounded-2xl border bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{t("home_services_by_business_level_title")}</h2>
                <p className="text-sm text-slate-600">
                  {t("home_services_by_business_level_subtitle")}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {categoriesByBusinessLevel.map((group) => (
                <BusinessLevelCard
                  key={group.level}
                  title={t(group.meta?.titleKey || "", { defaultValue: group.level })}
                  subtitle={t(group.meta?.subtitleKey || "", { defaultValue: "" })}
                  badge={t(group.meta?.badgeKey || "", { defaultValue: group.level })}
                  tone={group.meta?.tone}
                  items={group.items}
                  t={t}
                  onOpen={(item) => navigate(`/customer/services/${item.slug || item._id}`)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {promoPrimary ? (
          <section className="overflow-hidden rounded-2xl border bg-white">
            <div className="relative">
              <img
                src={getPromoImage(promoPrimary)}
                alt={promoPrimary.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.dataset.fallbackApplied === "1") {
                    target.onerror = null;
                    target.src = IMAGE_FALLBACK;
                    return;
                  }
                  target.dataset.fallbackApplied = "1";
                  target.src = getBackupImageForService(promoPrimary.name);
                }}
                className="h-52 w-full object-cover sm:h-72"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
              <div className="absolute left-6 top-6 max-w-md text-white">
                <p className="text-3xl font-semibold leading-tight">{t("home_book_service_in_city", { service: promoPrimary.name, city: cityName })}</p>
                <p className="mt-2 text-xl">{t("starts_at")} {formatPrice(promoPrimary.basePrice)}</p>
                <button
                  onClick={() => bookService(promoPrimary)}
                  className="mt-4 h-11 rounded-lg bg-white px-4 text-sm font-semibold text-slate-900"
                >
                  {t("bookNow")}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {loadingSections ? (
          <section className="rounded-xl border bg-white p-5 text-sm text-slate-500">{t("loading_services")}</section>
        ) : (
          <>
            {(sectionsForSelectedLevel.length ? sectionsForSelectedLevel : sections).map((section) => (
              <HorizontalServiceStrip
                key={section.id}
                title={section.name}
                items={section.services}
                onOpen={(item) => navigate(`/customer/services/${item.categorySlug || item.categoryId}/details/${item.slug || item.id}`)}
              />
            ))}

            {scopedMostBooked.length > 0 ? (
              <HorizontalServiceStrip
                title={t("home_most_booked_for_level", { level: t(levelExperience?.labelKey || "", { defaultValue: "Selected" }) })}
                items={scopedMostBooked}
                onOpen={(item) => navigate(`/customer/services/${item.categorySlug || item.categoryId}/details/${item.slug || item.id}`)}
              />
            ) : null}
          </>
        )}

        {promoCards.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {promoCards.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border bg-white">
                <img
                  src={getPromoImage(item)}
                  alt={item.name}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.dataset.fallbackApplied === "1") {
                      target.onerror = null;
                      target.src = IMAGE_FALLBACK;
                      return;
                    }
                    target.dataset.fallbackApplied = "1";
                    target.src = getBackupImageForService(item.name);
                  }}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-2xl font-semibold leading-tight">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{t("starts_at")} {formatPrice(item.basePrice)}</p>
                  <button
                    onClick={() => bookService(item)}
                    className="mt-3 h-9 rounded-md bg-primary px-4 text-sm font-semibold text-white"
                  >
                    {t("bookNow")}
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </>
  );
}

function Metric({ title, subtitle }) {
  return (
    <article className="rounded-xl border border-white/20 bg-white/10 p-3">
      <p className="text-xl font-semibold">{title}</p>
      <p className="text-xs text-slate-200">{subtitle}</p>
    </article>
  );
}

function BusinessLevelCard({ title, subtitle, badge, tone, items, onOpen, t }) {
  return (
    <article className={`rounded-xl border bg-gradient-to-br p-4 ${tone || "from-slate-50 to-white border-slate-200"}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
          {badge}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item._id}
            onClick={() => onOpen(item)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            {translateEntity(t, "category_name", item, item.name)}
          </button>
        ))}
      </div>
    </article>
  );
}


function HorizontalServiceStrip({ title, items, onOpen }) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [items.length]);

  const scrollBy = (delta) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="relative rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-3xl font-semibold text-slate-900">{title}</h3>
      </div>

      <div
        ref={containerRef}
        className="flex snap-x gap-4 overflow-x-auto pb-1 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onOpen(item)}
            className="w-72 shrink-0 snap-start rounded-xl bg-white text-left transition hover:-translate-y-0.5"
          >
            <div className="relative">
              <img
              src={getServiceImage(item)}
                alt={item.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.dataset.fallbackApplied === "1") {
                    target.onerror = null;
                    target.src = getSemanticFallbackImage(item.name);
                    return;
                  }
                  target.dataset.fallbackApplied = "1";
                  target.src = getBackupImageForService(item.name);
                }}
                className="h-40 w-full rounded-xl object-cover"
              />
            </div>
            <div className="pt-2">
              <p className="line-clamp-2 text-2xl font-medium text-slate-900">{item.name}</p>
            </div>
          </button>
        ))}
      </div>

      {canScrollLeft ? (
        <button
          onClick={() => scrollBy(-360)}
          className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow md:inline-flex"
          aria-label={`Scroll ${title} left`}
        >
          <Icon name="ChevronLeft" size={18} />
        </button>
      ) : null}

      {canScrollRight ? (
        <button
          onClick={() => scrollBy(360)}
          className="absolute right-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full border border-slate-300 bg-white text-slate-700 shadow hover:bg-slate-50"
          aria-label={`Scroll ${title} right`}
        >
          <span className="inline-flex items-center justify-center">
            <Icon name="ChevronRight" size={19} />
          </span>
        </button>
      ) : null}
    </section>
  );
}





import { Helmet } from "react-helmet";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/components/AppIcon";
import { fetchPublicCategories } from "@/services/categoryService";
import { translateEntity } from "@/utils/i18nEntity";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1607002852058-0b0f18bdf431?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=700&q=80",
];

const ICONS = [
  "Sparkles",
  "Scissors",
  "SprayCan",
  "Wrench",
  "Droplets",
  "PaintBucket",
  "Fan",
  "PanelsTopLeft",
  "Hammer",
  "ShieldCheck",
];

export default function ServiceProviderSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchPublicCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load public categories", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((item) => item.name?.toLowerCase().includes(q));
  }, [categories, query]);

  return (
    <>
      <Helmet>
        <title>{t("appName")}</title>
      </Helmet>

      <div className="mx-auto max-w-7xl pb-10">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1.35fr]">
          <div className="space-y-5">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] leading-[1.05] font-semibold text-slate-900">
              {t("home_services_doorstep")}
            </h1>

            <article className="rounded-xl border bg-white p-5">
              <h2 className="text-[30px] font-semibold text-slate-900">{t("what_are_you_looking_for")}</h2>

              {loading ? (
                <p className="mt-4 text-sm text-slate-500">{t("loading_categories")}</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {filtered.map((item, index) => (
                    <button
                      key={item._id}
                      onClick={() => navigate(`/customer/services/${item.slug || item._id}`)}
                      className="rounded-lg border bg-slate-50 p-3 text-left transition hover:bg-slate-100"
                    >
                      <div className="h-11 w-11 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <Icon name={ICONS[index % ICONS.length]} size={18} />
                      </div>
                      <p className="mt-2 text-xs font-medium text-slate-800 leading-4 min-h-8">
                        {translateEntity(t, "category_name", item, item.name)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </article>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <img src={HERO_IMAGES[0]} alt="Service 1" className="h-40 sm:h-[220px] lg:h-[270px] w-full rounded-xl object-cover" />
            <img src={HERO_IMAGES[1]} alt="Service 2" className="h-40 sm:h-[220px] lg:h-[270px] w-full rounded-xl object-cover" />
            <img src={HERO_IMAGES[2]} alt="Service 3" className="h-40 sm:h-[220px] lg:h-[270px] w-full rounded-xl object-cover" />
            <img src={HERO_IMAGES[3]} alt="Service 4" className="h-40 sm:h-[220px] lg:h-[270px] w-full rounded-xl object-cover" />
          </div>
        </section>
      </div>
    </>
  );
}

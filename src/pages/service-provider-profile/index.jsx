import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import Icon from "@/components/AppIcon";

const PROVIDER_DATA = {
  1: {
    name: "Rahul Electrician",
    title: "Master Electrician",
    location: "Mancherial, Telangana",
    rating: 4.8,
    reviews: 182,
    completed: 420,
    response: "10 mins",
    years: 9,
    priceFrom: 299,
    about:
      "Specialized in residential wiring, switchboard upgrades, and electrical fault diagnosis with same-day visit support.",
    services: [
      { name: "Fault Inspection", price: 299, eta: "30-45 mins" },
      { name: "Switchboard Repair", price: 399, eta: "45-60 mins" },
      { name: "Fan / Light Installation", price: 249, eta: "20-30 mins" },
    ],
    reviewsList: [
      { name: "Ankita", rating: 5, comment: "Quick fix, very professional and clean work." },
      { name: "Ramesh", rating: 4, comment: "Good communication and on-time service." },
    ],
    badges: ["Police Verified", "Background Checked", "Service Warranty"],
  },
  2: {
    name: "Amit Plumber",
    title: "Certified Plumbing Expert",
    location: "Bellampalli, Mancherial",
    rating: 4.6,
    reviews: 121,
    completed: 290,
    response: "20 mins",
    years: 7,
    priceFrom: 249,
    about:
      "Experienced in leakage repair, bathroom fittings, and kitchen sink installations for apartments and villas.",
    services: [
      { name: "Leakage Repair", price: 249, eta: "30 mins" },
      { name: "Tap Replacement", price: 199, eta: "20 mins" },
      { name: "Toilet Flush Repair", price: 349, eta: "45 mins" },
    ],
    reviewsList: [
      { name: "Nikita", rating: 5, comment: "Solved a long-standing pipe issue perfectly." },
      { name: "Harish", rating: 4, comment: "Polite and skilled technician." },
    ],
    badges: ["Verified", "Reliable Response", "Transparent Pricing"],
  },
};

export default function ServiceProviderProfile() {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState(0);

  const provider = useMemo(() => {
    if (!providerId) return null;
    return PROVIDER_DATA[providerId] || PROVIDER_DATA[1];
  }, [providerId]);

  if (!provider) return null;

  const service = provider.services[selectedService];

  return (
    <>
      <Helmet>
        <title>{provider.name}</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-2xl border bg-white p-6">
          <button
            onClick={() => navigate("/customer/home")}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <Icon name="ArrowLeft" size={14} />
            {t("back_to_results", { defaultValue: "Back to results" })}
          </button>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-primary font-semibold">{provider.title}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{provider.name}</h1>
              <p className="text-sm text-slate-600 mt-2 inline-flex items-center gap-2">
                <Icon name="MapPin" size={14} />
                {provider.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <Metric label={t("rating", { defaultValue: "Rating" })} value={`${provider.rating}/5`} />
              <Metric label={t("reviews", { defaultValue: "Reviews" })} value={`${provider.reviews}`} />
              <Metric label={t("completed_jobs", { defaultValue: "Completed Jobs" })} value={`${provider.completed}+`} />
              <Metric label={t("response_time", { defaultValue: "Response Time" })} value={provider.response} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {t("about_provider", { defaultValue: "About Provider" })}
              </h2>
              <p className="text-sm text-slate-600 mt-2">{provider.about}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {provider.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {t("services_offered", { defaultValue: "Services Offered" })}
              </h2>

              <div className="mt-4 space-y-3">
                {provider.services.map((item, index) => (
                  <button
                    key={item.name}
                    onClick={() => setSelectedService(index)}
                    className={`w-full rounded-xl border p-4 text-left ${
                      selectedService === index
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {t("estimated_time", { defaultValue: "Estimated Time" })}: {item.eta}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900">Rs {item.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {t("customer_reviews", { defaultValue: "Customer Reviews" })}
              </h2>
              <div className="mt-4 space-y-3">
                {provider.reviewsList.map((review, idx) => (
                  <article key={`${review.name}-${idx}`} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{review.name}</p>
                      <p className="text-xs rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                        {review.rating} / 5
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{review.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border bg-white p-5 sticky top-24">
              <h3 className="text-base font-semibold text-slate-900">
                {t("booking_summary", { defaultValue: "Booking Summary" })}
              </h3>
              <div className="mt-4 space-y-2 text-sm">
                <Row
                  label={t("selected_service", { defaultValue: "Selected Service" })}
                  value={service.name}
                />
                <Row
                  label={t("starting_price", { defaultValue: "Starting Price" })}
                  value={`Rs ${service.price}`}
                />
                <Row
                  label={t("response_time", { defaultValue: "Response Time" })}
                  value={provider.response}
                />
                <Row
                  label={t("experience", { defaultValue: "Experience" })}
                  value={`${provider.years} ${t("years", { defaultValue: "years" })}`}
                />
              </div>

              <button
                onClick={() => navigate("/customer/home")}
                className="mt-5 h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:opacity-95"
              >
                {t("request_service", { defaultValue: "Request Service" })}
              </button>
              <button
                onClick={() => navigate("/customer/home")}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("message_provider", { defaultValue: "Message Provider" })}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 text-right">{value}</span>
    </div>
  );
}

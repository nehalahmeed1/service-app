import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/components/AppIcon";

export default function ProviderGrowthHubPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const playbooks = [
    {
      title: t("increase_repeat_bookings"),
      detail: t("increase_repeat_bookings_desc"),
      icon: "Repeat2",
    },
    {
      title: t("improve_profile_trust"),
      detail: t("improve_profile_trust_desc"),
      icon: "ShieldCheck",
    },
    {
      title: t("boost_conversion_rate"),
      detail: t("boost_conversion_rate_desc"),
      icon: "Rocket",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t("growth_hub")}</title>
      </Helmet>

      <main className="space-y-6">
        <section className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">{t("growth_hub")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("growth_hub_subtitle")}
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {playbooks.map((item) => (
            <article key={item.title} className="rounded-xl border bg-white p-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Icon name={item.icon} size={16} />
              </div>
              <h2 className="font-semibold mt-3">{item.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold text-lg mb-4">{t("action_center")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ActionBtn
              label={t("edit_services")}
              onClick={() => navigate("/provider/services")}
              icon="ClipboardEdit"
            />
            <ActionBtn
              label={t("provider_manage_schedule")}
              onClick={() => navigate("/provider/schedule")}
              icon="CalendarClock"
            />
            <ActionBtn
              label={t("verification_center")}
              onClick={() => navigate("/provider/verification-center")}
              icon="BadgeCheck"
            />
            <ActionBtn
              label={t("profile_settings")}
              onClick={() => navigate("/provider/profile/edit")}
              icon="UserRoundCog"
            />
            <ActionBtn
              label={t("verification_history")}
              onClick={() => navigate("/provider/verification-history")}
              icon="History"
            />
          </div>
        </section>
      </main>
    </>
  );
}

function ActionBtn({ label, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="h-11 rounded-md border bg-white hover:bg-gray-50 text-sm font-medium inline-flex items-center justify-center gap-2"
    >
      <Icon name={icon} size={15} />
      {label}
    </button>
  );
}

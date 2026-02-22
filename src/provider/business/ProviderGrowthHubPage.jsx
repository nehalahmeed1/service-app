import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/AppIcon";

const playbooks = [
  {
    title: "Increase repeat bookings",
    detail: "Offer 7-day follow-up and proactive reminders after each job.",
    icon: "Repeat2",
  },
  {
    title: "Improve profile trust",
    detail: "Keep profile, verification, and service photos updated monthly.",
    icon: "ShieldCheck",
  },
  {
    title: "Boost conversion rate",
    detail: "Respond to requests within 5 minutes during business hours.",
    icon: "Rocket",
  },
];

export default function ProviderGrowthHubPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Provider Growth Hub</title>
      </Helmet>

      <main className="space-y-6">
        <section className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">Growth Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Playbooks and controls to grow revenue and service quality.
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
          <h2 className="font-semibold text-lg mb-4">Action Center</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ActionBtn
              label="Edit Services"
              onClick={() => navigate("/provider/services")}
              icon="ClipboardEdit"
            />
            <ActionBtn
              label="Manage Schedule"
              onClick={() => navigate("/provider/schedule")}
              icon="CalendarClock"
            />
            <ActionBtn
              label="Verification Center"
              onClick={() => navigate("/provider/verification-center")}
              icon="BadgeCheck"
            />
            <ActionBtn
              label="Profile Settings"
              onClick={() => navigate("/provider/profile/edit")}
              icon="UserRoundCog"
            />
            <ActionBtn
              label="Verification History"
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

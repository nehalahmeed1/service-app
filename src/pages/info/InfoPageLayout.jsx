import { Helmet } from "react-helmet";

export default function InfoPageLayout({ title, subtitle, sections = [] }) {
  return (
    <>
      <Helmet>
        <title>{title} | ServiceConnect</title>
      </Helmet>

      <div className="mx-auto max-w-4xl space-y-5 pb-10">
        <section className="rounded-2xl border bg-white p-6">
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
        </section>

        {sections.map((section) => (
          <section key={section.heading} className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">{section.heading}</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {section.points.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}


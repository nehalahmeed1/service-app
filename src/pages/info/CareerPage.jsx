import InfoPageLayout from "./InfoPageLayout";

export default function CareerPage() {
  return (
    <InfoPageLayout
      title="Career"
      subtitle="We are building operationally strong local commerce systems for customers, providers, and city teams."
      sections={[
        {
          heading: "Open Domains",
          points: [
            "Engineering: frontend, backend, reliability, and platform operations.",
            "Operations: city launches, service quality, and provider success.",
            "Support: customer resolution and escalation management.",
          ],
        },
        {
          heading: "How To Apply",
          points: [
            "Share your profile, role interest, and portfolio with your relevant work.",
            "Highlight measurable outcomes from previous projects or operational ownership.",
            "Shortlisted candidates are contacted for role-specific evaluation rounds.",
          ],
        },
      ]}
    />
  );
}


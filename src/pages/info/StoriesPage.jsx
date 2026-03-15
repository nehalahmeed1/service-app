import InfoPageLayout from "./InfoPageLayout";

export default function StoriesPage() {
  return (
    <InfoPageLayout
      title="Stories"
      subtitle="Read real examples of how customers and professionals use ServiceConnect in everyday operations."
      sections={[
        {
          heading: "Customer Stories",
          points: [
            "Emergency repairs resolved with same-day assignment and progress tracking.",
            "Recurring home maintenance planned through predictable service windows.",
            "Transparent dispute workflows improved confidence for repeat bookings.",
          ],
        },
        {
          heading: "Professional Stories",
          points: [
            "Independent providers expanded local demand with verified profiles.",
            "Small teams improved scheduling discipline using status-driven job workflows.",
            "Enterprise-focused partners standardized documentation for audit-ready closeouts.",
          ],
        },
      ]}
    />
  );
}


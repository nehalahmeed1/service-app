import InfoPageLayout from "./InfoPageLayout";

export default function AboutUsPage() {
  return (
    <InfoPageLayout
      title="About Us"
      subtitle="ServiceConnect is a local services platform focused on trusted professionals, transparent pricing, and faster service fulfillment."
      sections={[
        {
          heading: "Who We Are",
          points: [
            "We connect customers with verified professionals across home, maintenance, and wellness services.",
            "Our goal is to make booking, tracking, and support simple for both customers and service partners.",
          ],
        },
        {
          heading: "What We Value",
          points: [
            "Trust first: background checks, onboarding verification, and accountable service records.",
            "Clear pricing: upfront package estimates with visible fee and tax breakdown.",
            "Reliable operations: request tracking, SLA visibility, and escalation support.",
          ],
        },
      ]}
    />
  );
}


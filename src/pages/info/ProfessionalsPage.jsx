import InfoPageLayout from "./InfoPageLayout";

export default function ProfessionalsPage() {
  return (
    <InfoPageLayout
      title="Professionals"
      subtitle="Grow your service business with structured leads, verified bookings, and performance visibility."
      sections={[
        {
          heading: "Why Join ServiceConnect",
          points: [
            "Access consistent demand from customers in your serviceable locations.",
            "Receive booking details, status workflows, and payout-ready job records in one place.",
            "Build trust through profile verification, ratings, and completion proof.",
          ],
        },
        {
          heading: "How Onboarding Works",
          points: [
            "Create your provider account and complete profile, identity, address, work, and bank verification.",
            "Submit documents and service categories you handle.",
            "Once approved, start receiving assignable jobs based on your category and availability.",
          ],
        },
      ]}
    />
  );
}


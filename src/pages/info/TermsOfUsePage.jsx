import InfoPageLayout from "./InfoPageLayout";

export default function TermsOfUsePage() {
  return (
    <InfoPageLayout
      title="Terms Of Use"
      subtitle="These terms govern your use of ServiceConnect platform features and booking services."
      sections={[
        {
          heading: "Platform Usage",
          points: [
            "Users must provide accurate account and booking information.",
            "Abusive, fraudulent, or illegal use of the platform is prohibited.",
            "ServiceConnect may suspend access for policy violations or misuse.",
          ],
        },
        {
          heading: "Bookings and Payments",
          points: [
            "Booking confirmation is subject to provider assignment and operational availability.",
            "Displayed prices may include service fee and taxes where applicable.",
            "Cancellations, reschedules, disputes, and reviews are managed under operational policy workflows.",
          ],
        },
      ]}
    />
  );
}


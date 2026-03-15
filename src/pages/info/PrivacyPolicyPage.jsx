import InfoPageLayout from "./InfoPageLayout";

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      subtitle="We collect only the information required to provide booking, verification, and support workflows."
      sections={[
        {
          heading: "Information We Use",
          points: [
            "Account details such as name, phone, email, and address for booking operations.",
            "Service and transaction data to manage assignments, payments, and support resolution.",
            "Verification documents for provider onboarding and compliance checks.",
          ],
        },
        {
          heading: "How We Protect Data",
          points: [
            "Access controls and authentication are used for protected account and admin actions.",
            "Sensitive workflows are restricted to authorized roles only.",
            "Data is retained only as needed for service delivery, legal, and operational requirements.",
          ],
        },
      ]}
    />
  );
}


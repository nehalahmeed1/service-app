import InfoPageLayout from "./InfoPageLayout";

export default function RefundPolicyPage() {
  return (
    <InfoPageLayout
      title="Refund Policy"
      subtitle="Refund outcomes depend on booking status, cancellation timing, and dispute resolution decisions."
      sections={[
        {
          heading: "Eligible Cases",
          points: [
            "Booking cancelled before service start as per cancellation rules.",
            "Service not delivered or materially incomplete after review.",
            "Approved dispute outcomes such as full or partial refund.",
          ],
        },
        {
          heading: "Processing",
          points: [
            "Refund requests are reviewed with booking timeline, proof, and dispute records.",
            "Approved refunds are marked in payment status as REFUNDED or PARTIALLY_REFUNDED.",
            "Settlement timelines depend on payment method and banking rails.",
          ],
        },
      ]}
    />
  );
}


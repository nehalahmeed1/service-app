import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import Icon from "@/components/AppIcon";
import {
  fetchCustomerBookings,
  cancelCustomerBooking,
  rescheduleCustomerBooking,
  raiseCustomerBookingDispute,
  submitCustomerBookingReview,
  submitCustomerBookingPayment,
} from "@/services/customerBookingService";

const STATUS_STEPS = [
  "BOOKED",
  "PROVIDER_ASSIGNED",
  "ACCEPTED",
  "ARRIVING",
  "IN_PROGRESS",
  "SERVICE_DONE",
  "PROOF_UPLOADED",
  "COMPLETED",
];

const STATUS_COLORS = {
  BOOKED: "bg-slate-100 text-slate-700",
  PROVIDER_ASSIGNED: "bg-cyan-100 text-cyan-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  ARRIVING: "bg-sky-100 text-sky-700",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  SERVICE_DONE: "bg-amber-100 text-amber-700",
  PROOF_UPLOADED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const toLabel = (value) =>
  (value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const PAYMENT_UPI_ID = import.meta.env.VITE_PAYMENT_UPI_ID || "payments@serviceconnect";
const PAYMENT_UPI_NAME = "ServiceConnect";

const getReviewLabel = (booking) => {
  const paymentStatus = booking.paymentStatus || "UNPAID";
  if (paymentStatus === "PAYMENT_PENDING") return "Payment Verification Pending";
  if (paymentStatus !== "PAID") return "Payment Required";
  return toLabel(booking.reviewStatus || "PENDING");
};

const buildUpiLink = (booking, amount) => {
  const params = new URLSearchParams({
    pa: PAYMENT_UPI_ID,
    pn: PAYMENT_UPI_NAME,
    am: String(Math.max(0, Number(amount || 0))),
    cu: "INR",
    tn: `Booking ${booking.id}`,
  });
  return `upi://pay?${params.toString()}`;
};

const businessLevelLabel = (level) => {
  if (level === "ENTERPRISE") return "Enterprise";
  if (level === "SMALL_TEAM") return "Small Team";
  return "Individual";
};

const INITIAL_MODAL_FORM = {
  reason: "",
  bookingDate: "",
  timeSlot: "",
  details: "",
  rating: "5",
  comment: "",
  paymentMethod: "UPI",
  paymentReference: "",
  paymentAmount: "",
  paidAt: "",
};

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalForm, setModalForm] = useState(INITIAL_MODAL_FORM);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchCustomerBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeBookings = useMemo(
    () => bookings.filter((item) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(item.status)),
    [bookings]
  );

  const openModal = (type, booking) => {
    setModalType(type);
    setSelectedBooking(booking);
    setModalError("");
    setModalForm({
      ...INITIAL_MODAL_FORM,
      bookingDate: booking?.date || "",
      timeSlot: booking?.time || "",
      paymentAmount: String(Number(booking?.priceBreakdown?.total ?? booking?.price ?? 0)),
      paidAt: new Date().toISOString().slice(0, 16),
    });
  };

  const closeModal = () => {
    setModalType("");
    setSelectedBooking(null);
    setModalError("");
    setModalLoading(false);
    setModalForm(INITIAL_MODAL_FORM);
  };

  const submitModal = async () => {
    if (!selectedBooking?.id) return;
    setModalError("");

    try {
      setModalLoading(true);

      if (modalType === "cancel") {
        if (!modalForm.reason.trim()) {
          setModalError("Cancellation reason is required.");
          return;
        }
        await cancelCustomerBooking(selectedBooking.id, modalForm.reason.trim());
      }

      if (modalType === "reschedule") {
        if (!modalForm.bookingDate.trim() || !modalForm.timeSlot.trim()) {
          setModalError("New date and time slot are required.");
          return;
        }
        await rescheduleCustomerBooking(selectedBooking.id, {
          bookingDate: modalForm.bookingDate.trim(),
          timeSlot: modalForm.timeSlot.trim(),
          reason: modalForm.reason.trim(),
        });
      }

      if (modalType === "dispute") {
        if (!modalForm.reason.trim()) {
          setModalError("Dispute reason is required.");
          return;
        }
        await raiseCustomerBookingDispute(selectedBooking.id, {
          reason: modalForm.reason.trim(),
          details: modalForm.details.trim(),
        });
      }

      if (modalType === "review") {
        const rating = Number(modalForm.rating);
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
          setModalError("Rating must be between 1 and 5.");
          return;
        }
        await submitCustomerBookingReview(selectedBooking.id, {
          rating,
          comment: modalForm.comment.trim(),
        });
      }

      if (modalType === "payment") {
        const amount = Number(modalForm.paymentAmount || 0);
        if (!Number.isFinite(amount) || amount <= 0) {
          setModalError("Enter a valid payment amount.");
          return;
        }
        if (!modalForm.paymentReference.trim()) {
          setModalError("Payment reference is required.");
          return;
        }
        await submitCustomerBookingPayment(selectedBooking.id, {
          method: modalForm.paymentMethod,
          reference: modalForm.paymentReference.trim(),
          amount,
          paidAt: modalForm.paidAt || undefined,
        });
      }

      closeModal();
      await load();
    } catch (err) {
      setModalError(err?.response?.data?.message || "Action failed");
    } finally {
      setModalLoading(false);
    }
  };

  const getModalTitle = () => {
    if (modalType === "cancel") return "Cancel Booking";
    if (modalType === "reschedule") return "Reschedule Booking";
    if (modalType === "dispute") return "Raise Dispute";
    if (modalType === "review") return "Submit Review";
    if (modalType === "payment") return "Submit Payment Details";
    return "";
  };

  return (
    <>
      <Helmet>
        <title>My Bookings</title>
      </Helmet>

      <div className="mx-auto max-w-6xl space-y-5 pb-10">
        <section className="rounded-xl border bg-white p-5">
          <h1 className="text-3xl font-semibold text-slate-900">My Bookings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track provider acceptance, live job progress, and completion proof.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
            <Icon name="Bell" size={14} />
            {activeBookings.length} active booking update(s)
          </div>
        </section>

        {loading ? (
          <section className="rounded-xl border bg-white p-5 text-sm text-slate-500">Loading bookings...</section>
        ) : error ? (
          <section className="rounded-xl border bg-red-50 p-5 text-sm text-red-700">{error}</section>
        ) : bookings.length === 0 ? (
          <section className="rounded-xl border bg-white p-5 text-sm text-slate-500">No bookings found yet.</section>
        ) : (
          <section className="space-y-4">
            {bookings.map((booking) => {
              const payableAmount = Number(booking?.priceBreakdown?.total ?? booking.price ?? 0);
              const paymentStatus = booking.paymentStatus || "UNPAID";
              const paymentRequired = ["PROOF_UPLOADED", "COMPLETED"].includes(booking.status) && paymentStatus === "UNPAID";
              const paymentPending = paymentStatus === "PAYMENT_PENDING";
              const upiLink = buildUpiLink(booking, payableAmount);
              const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;

              return (
              <article key={booking.id} className="rounded-xl border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{booking.serviceName}</h2>
                    <p className="mt-1 text-sm text-slate-600">{booking.categoryName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {booking.date} | {booking.time}
                    </p>
                    <p className="text-sm text-slate-600">{booking.address}</p>
                    <p className="text-sm text-slate-600">
                      Mode: {businessLevelLabel(booking.bookingContext?.businessLevel)}
                    </p>
                    <p className="text-sm text-slate-600">Amount: Rs {payableAmount.toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[booking.status] || "bg-slate-100 text-slate-700"}`}>
                    {toLabel(booking.status)}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Booking Timeline</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STATUS_STEPS.map((step) => {
                      const reached = (booking.statusHistory || []).some((h) => h.status === step) || booking.status === step;
                      return (
                        <span
                          key={step}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            reached ? "bg-primary/10 text-primary border border-primary/30" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {toLabel(step)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {booking.provider ? (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-medium">Provider: {booking.provider.name}</p>
                    {booking.provider.phone ? <p>Phone: {booking.provider.phone}</p> : null}
                  </div>
                ) : null}

                {booking.bookingContext ? (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-medium">Service Context</p>
                    <p>Landmark: {booking.bookingContext.landmark || "-"}</p>
                    <p>Instructions: {booking.bookingContext.specialInstructions || "-"}</p>
                    {booking.bookingContext.businessLevel === "SMALL_TEAM" ? (
                      <>
                        <p>Team: {booking.bookingContext.smallTeam?.teamName || "-"}</p>
                        <p>Coordinator: {booking.bookingContext.smallTeam?.coordinator || "-"}</p>
                      </>
                    ) : null}
                    {booking.bookingContext.businessLevel === "ENTERPRISE" ? (
                      <>
                        <p>Company: {booking.bookingContext.enterprise?.companyName || "-"}</p>
                        <p>Facility: {booking.bookingContext.enterprise?.facilityType || "-"}</p>
                        <p>Coordinator: {booking.bookingContext.enterprise?.coordinator || "-"}</p>
                      </>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {["BOOKED", "PROVIDER_ASSIGNED", "ACCEPTED", "ARRIVING"].includes(booking.status) ? (
                    <button
                      onClick={() => openModal("cancel", booking)}
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Cancel Booking
                    </button>
                  ) : null}

                  {["BOOKED", "PROVIDER_ASSIGNED", "ACCEPTED", "ARRIVING"].includes(booking.status) ? (
                    <button
                      onClick={() => openModal("reschedule", booking)}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                    >
                      Reschedule
                    </button>
                  ) : null}

                  {["PROOF_UPLOADED", "COMPLETED"].includes(booking.status) ? (
                    <button
                      onClick={() => openModal("dispute", booking)}
                      className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100"
                    >
                      Raise Dispute
                    </button>
                  ) : null}

                  {booking.status === "COMPLETED" &&
                  (booking.paymentStatus || "UNPAID") === "PAID" &&
                  booking.reviewStatus !== "SUBMITTED" ? (
                    <button
                      onClick={() => openModal("review", booking)}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      Submit Review
                    </button>
                  ) : null}

                  {paymentRequired ? (
                    <button
                      onClick={() => openModal("payment", booking)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    >
                      I Have Paid
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                    Payment: {toLabel(booking.paymentStatus || "UNPAID")}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                    Review: {getReviewLabel(booking)}
                  </span>
                  {(booking.disputes || []).some((d) => ["OPEN", "UNDER_REVIEW"].includes(d.status)) ? (
                    <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">
                      Dispute Open
                    </span>
                  ) : null}
                </div>

                {paymentRequired ? (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">Payment Pending</p>
                    <p className="mt-1 text-xs text-slate-700">
                      Scan this phone barcode (QR) to pay Rs {payableAmount.toLocaleString()}.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <img
                        src={upiQrUrl}
                        alt="Payment QR"
                        className="h-36 w-36 rounded border border-amber-200 bg-white p-1"
                      />
                      <div className="text-xs text-slate-700">
                        <p>
                          <strong>UPI ID:</strong> {PAYMENT_UPI_ID}
                        </p>
                        <p>
                          <strong>Payee:</strong> {PAYMENT_UPI_NAME}
                        </p>
                        <p>
                          <strong>Reference:</strong> Booking {booking.id}
                        </p>
                        <a
                          href={upiLink}
                          className="mt-2 inline-flex rounded border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                        >
                          Open UPI App
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}

                {paymentPending ? (
                  <div className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">Payment Verification in Progress</p>
                    <p className="mt-1 text-xs text-slate-700">
                      Customer payment details are submitted and pending admin verification.
                    </p>
                    <div className="mt-2 text-xs text-slate-700">
                      <p>
                        <strong>Method:</strong> {booking.payment?.method || "-"}
                      </p>
                      <p>
                        <strong>Reference:</strong> {booking.payment?.customerReference || booking.paymentReference || "-"}
                      </p>
                      <p>
                        <strong>Submitted At:</strong>{" "}
                        {booking.payment?.submittedAt ? new Date(booking.payment.submittedAt).toLocaleString() : "-"}
                      </p>
                    </div>
                  </div>
                ) : null}

                {booking.completionProofImages?.length ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-800">Completion Proof</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {booking.completionProofImages.map((src) => (
                        <a
                          key={src}
                          href={`${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${src}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Icon name="Image" size={12} />
                          View proof
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            )})}
          </section>
        )}
      </div>

      {modalType && selectedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{getModalTitle()}</h3>
              <button onClick={closeModal} className="rounded border p-1 hover:bg-slate-50">
                <Icon name="X" size={14} />
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              {selectedBooking.serviceName} | {selectedBooking.date} {selectedBooking.time}
            </p>

            <div className="mt-4 space-y-3">
              {modalType === "cancel" ? (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Cancellation Reason</span>
                  <textarea
                    value={modalForm.reason}
                    onChange={(e) => setModalForm((p) => ({ ...p, reason: e.target.value }))}
                    rows={3}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
              ) : null}

              {modalType === "reschedule" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">New Date</span>
                    <input
                      type="date"
                      value={modalForm.bookingDate}
                      onChange={(e) => setModalForm((p) => ({ ...p, bookingDate: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">New Time Slot</span>
                    <input
                      value={modalForm.timeSlot}
                      onChange={(e) => setModalForm((p) => ({ ...p, timeSlot: e.target.value }))}
                      placeholder="e.g. 10:00-11:00"
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Reason (optional)</span>
                    <textarea
                      value={modalForm.reason}
                      onChange={(e) => setModalForm((p) => ({ ...p, reason: e.target.value }))}
                      rows={2}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                </>
              ) : null}

              {modalType === "dispute" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Dispute Reason</span>
                    <input
                      value={modalForm.reason}
                      onChange={(e) => setModalForm((p) => ({ ...p, reason: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Details</span>
                    <textarea
                      value={modalForm.details}
                      onChange={(e) => setModalForm((p) => ({ ...p, details: e.target.value }))}
                      rows={3}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                </>
              ) : null}

              {modalType === "review" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Rating</span>
                    <select
                      value={modalForm.rating}
                      onChange={(e) => setModalForm((p) => ({ ...p, rating: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={String(r)}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Comment</span>
                    <textarea
                      value={modalForm.comment}
                      onChange={(e) => setModalForm((p) => ({ ...p, comment: e.target.value }))}
                      rows={3}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                </>
              ) : null}

              {modalType === "payment" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Payment Method</span>
                    <select
                      value={modalForm.paymentMethod}
                      onChange={(e) => setModalForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    >
                      <option value="UPI">UPI</option>
                      <option value="CARD">Card</option>
                      <option value="NET_BANKING">Net Banking</option>
                      <option value="WALLET">Wallet</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Amount (INR)</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={modalForm.paymentAmount}
                      onChange={(e) => setModalForm((p) => ({ ...p, paymentAmount: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Payment Reference / UTR</span>
                    <input
                      value={modalForm.paymentReference}
                      onChange={(e) => setModalForm((p) => ({ ...p, paymentReference: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                      placeholder="Enter UTR / transaction id"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Paid At</span>
                    <input
                      type="datetime-local"
                      value={modalForm.paidAt}
                      onChange={(e) => setModalForm((p) => ({ ...p, paidAt: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                </>
              ) : null}
            </div>

            {modalError ? <p className="mt-3 text-sm text-red-600">{modalError}</p> : null}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="rounded border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                disabled={modalLoading}
              >
                Close
              </button>
              <button
                onClick={submitModal}
                className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={modalLoading}
              >
                {modalLoading ? "Please wait..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

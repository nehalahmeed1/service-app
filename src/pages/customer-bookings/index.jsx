import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import Icon from "@/components/AppIcon";
import {
  fetchCustomerBookings,
  cancelCustomerBooking,
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

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const run = async () => {
      try {
        await load();
      } catch (_) {}
    };
    run();
  }, []);

  const handleCancel = async (bookingId) => {
    const reason = window.prompt("Enter cancellation reason");
    if (reason === null) return;

    try {
      await cancelCustomerBooking(bookingId, reason.trim());
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel booking");
    }
  };

  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (item) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(item.status)
      ),
    [bookings]
  );

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
          <section className="rounded-xl border bg-white p-5 text-sm text-slate-500">
            Loading bookings...
          </section>
        ) : error ? (
          <section className="rounded-xl border bg-red-50 p-5 text-sm text-red-700">
            {error}
          </section>
        ) : bookings.length === 0 ? (
          <section className="rounded-xl border bg-white p-5 text-sm text-slate-500">
            No bookings found yet.
          </section>
        ) : (
          <section className="space-y-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-xl border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{booking.serviceName}</h2>
                    <p className="mt-1 text-sm text-slate-600">{booking.categoryName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {booking.date} | {booking.time}
                    </p>
                    <p className="text-sm text-slate-600">{booking.address}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_COLORS[booking.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {toLabel(booking.status)}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Booking Timeline
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STATUS_STEPS.map((step) => {
                      const reached =
                        (booking.statusHistory || []).some((h) => h.status === step) ||
                        booking.status === step;
                      return (
                        <span
                          key={step}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            reached
                              ? "bg-primary/10 text-primary border border-primary/30"
                              : "bg-slate-100 text-slate-500"
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

                {["BOOKED", "PROVIDER_ASSIGNED", "ACCEPTED", "ARRIVING"].includes(
                  booking.status
                ) ? (
                  <div className="mt-4">
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Cancel Booking
                    </button>
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
            ))}
          </section>
        )}
      </div>
    </>
  );
}

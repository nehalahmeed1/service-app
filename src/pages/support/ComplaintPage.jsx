import { useState } from "react";
import { createSupportRequest } from "@/services/supportService";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  city: "Mancherial",
  bookingId: "",
  subject: "",
  message: "",
};

export default function ComplaintPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      await createSupportRequest({
        type: "COMPLAINT",
        ...form,
      });
      setSuccess("Complaint registered successfully. Our escalation team will review this.");
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6">
      <h1 className="text-3xl font-semibold text-slate-900">Raise Complaint</h1>
      <p className="mt-2 text-sm text-slate-600">
        Use this form for service-quality or billing issues linked to a booking.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <Input label="Full Name" value={form.name} onChange={(v) => onChange("name", v)} required />
        <Input label="Email" type="email" value={form.email} onChange={(v) => onChange("email", v)} required />
        <Input label="Phone" value={form.phone} onChange={(v) => onChange("phone", v)} />
        <Input label="City" value={form.city} onChange={(v) => onChange("city", v)} />
        <Input
          label="Booking ID"
          value={form.bookingId}
          onChange={(v) => onChange("bookingId", v)}
          required
        />
        <Input label="Complaint Subject" value={form.subject} onChange={(v) => onChange("subject", v)} required />
        <TextArea
          label="Complaint Details"
          value={form.message}
          onChange={(v) => onChange("message", v)}
          required
          minLength={10}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, required = false, minLength = 0 }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        rows={5}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/components/AppIcon";
import { createCustomerBooking } from "@/services/customerBookingService";
import { useAuth } from "@/context/AuthContext";
import {
  fetchPublicCategories,
  fetchPublicSubCategories,
} from "@/services/categoryService";

const PRICE_MAP = {
  diag: 299,
  gas: 1599,
  service: 999,
  basic: 699,
  deep: 1999,
  bath: 499,
  leak: 249,
  tap: 299,
  flush: 399,
  wiring: 199,
  switch: 349,
  fan: 249,
  minor: 349,
  drill: 299,
  custom: 999,
  touchup: 599,
  room: 2999,
  waterproof: 3999,
};

export default function ServiceBookingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceSlug } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get("package") || "diag";
  const [resolvedSubCategoryRef, setResolvedSubCategoryRef] = useState(packageId);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const resolveBookingService = async () => {
      try {
        setServiceUnavailable(false);
        setResolvedSubCategoryRef(packageId);

        const categories = await fetchPublicCategories();
        const selectedCategory = (Array.isArray(categories) ? categories : []).find(
          (cat) => cat.slug === serviceSlug || cat._id === serviceSlug
        );

        if (!selectedCategory?._id) {
          setServiceUnavailable(true);
          return;
        }

        const subCategories = await fetchPublicSubCategories({
          categoryId: selectedCategory._id,
        });
        const list = Array.isArray(subCategories) ? subCategories : [];
        const selectedSub = list.find(
          (sub) => sub._id === packageId || sub.slug === packageId
        );

        if (!selectedSub?._id) {
          setServiceUnavailable(true);
          return;
        }

        setResolvedSubCategoryRef(selectedSub._id);
      } catch (error) {
        console.error("Failed to resolve booking service", error);
        setServiceUnavailable(true);
      }
    };

    resolveBookingService();
  }, [packageId, serviceSlug]);

  const basePrice = useMemo(() => PRICE_MAP[packageId] || 299, [packageId]);
  const serviceFee = 49;
  const tax = Math.round(basePrice * 0.05);
  const total = basePrice + serviceFee + tax;

  const slotOptions = useMemo(() => {
    const format12 = (hour) => {
      const suffix = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${hour12}:00 ${suffix}`;
    };

    const format24 = (hour) => `${String(hour).padStart(2, "0")}:00`;

    const result = [];
    for (let hour = 0; hour < 24; hour += 1) {
      const nextHour = (hour + 1) % 24;
      result.push({
        value: `${format24(hour)}-${format24(nextHour)}`,
        label: `${format24(hour)} - ${format24(nextHour)} (${format12(hour)} - ${format12(nextHour)})`,
      });
    }
    return result;
  }, []);

  const onPlaceOrder = async () => {
    if (!user) {
      navigate("/login", {
        state: {
          redirectTo: `${location.pathname}${location.search}`,
          source: "place_booking",
        },
      });
      return;
    }

    if (!date || !slot || !address.trim()) {
      alert(
        t("fill_booking_details", {
          defaultValue: "Please choose date, time slot and address.",
        })
      );
      return;
    }
    if (!resolvedSubCategoryRef || serviceUnavailable) {
      alert(t("selected_service_unavailable"));
      return;
    }

    try {
      setSubmitting(true);
      await createCustomerBooking({
        categorySlug: serviceSlug,
        subCategoryRef: resolvedSubCategoryRef,
        serviceSlug: resolvedSubCategoryRef,
        packageCode: resolvedSubCategoryRef,
        bookingDate: date,
        timeSlot: slot,
        address: address.trim(),
        price: total,
      });

      alert(
        t("booking_submitted", {
          defaultValue:
            "Booking submitted. Professional will be assigned shortly.",
        })
      );
      navigate("/customer/home");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        t("booking_failed", { defaultValue: "Failed to place booking." });
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("confirm_booking", { defaultValue: "Confirm Booking" })}</title>
      </Helmet>

      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-2xl border bg-white p-5">
          <button
            onClick={() => navigate(`/customer/services/${serviceSlug}`)}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <Icon name="ArrowLeft" size={14} />
            {t("back_to_packages", { defaultValue: "Back to packages" })}
          </button>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {t("confirm_booking", { defaultValue: "Confirm Booking" })}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("no_name_policy_note", {
              defaultValue: "Professional details will be shared after assignment.",
            })}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border bg-white p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-500">
                {t("service_date", { defaultValue: "Service Date" })}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500">
                {t("time_slot", { defaultValue: "Time Slot" })}
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="">{t("select_time_slot", { defaultValue: "Select slot" })}</option>
                {slotOptions.map((slotOption) => (
                  <option key={slotOption.value} value={slotOption.value}>
                    {slotOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500">
                {t("service_address", { defaultValue: "Service Address" })}
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </section>

          <aside className="rounded-2xl border bg-white p-5 h-fit">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("price_breakup", { defaultValue: "Price Breakup" })}
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <Row label={t("package_price", { defaultValue: "Package Price" })} value={`Rs ${basePrice}`} />
              <Row label={t("service_fee", { defaultValue: "Service Fee" })} value={`Rs ${serviceFee}`} />
              <Row label={t("taxes", { defaultValue: "Taxes" })} value={`Rs ${tax}`} />
              <div className="border-t pt-2 mt-2">
                <Row
                  label={t("total_payable", { defaultValue: "Total Payable" })}
                  value={`Rs ${total}`}
                  strong
                />
              </div>
            </div>
            <button
              onClick={onPlaceOrder}
              disabled={submitting}
              className="mt-5 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white"
            >
              {submitting
                ? t("booking_in_progress", { defaultValue: "Placing..." })
                : t("place_booking", { defaultValue: "Place Booking" })}
            </button>
          </aside>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className={strong ? "font-semibold text-slate-900" : "text-slate-800"}>{value}</span>
    </div>
  );
}

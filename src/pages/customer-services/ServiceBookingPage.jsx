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

function toServiceText(...parts) {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isAreaBasedService({ category, subCategory, serviceSlug, packageId }) {
  const text = toServiceText(
    category?.name,
    category?.slug,
    subCategory?.name,
    subCategory?.slug,
    serviceSlug,
    packageId
  );

  return /(paint|painting|tile|tiling|waterproof|wall|floor)/i.test(text);
}

function isQuantityBasedService({ category, subCategory, serviceSlug, packageId }) {
  const text = toServiceText(
    category?.name,
    category?.slug,
    subCategory?.name,
    subCategory?.slug,
    serviceSlug,
    packageId
  );

  return /(ac|air[\s-]?condition|aircon|split|window)/i.test(text);
}

export default function ServiceBookingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceSlug } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get("package") || "diag";
  const [resolvedSubCategoryRef, setResolvedSubCategoryRef] = useState(packageId);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedBusinessLevel, setSelectedBusinessLevel] = useState("INDIVIDUAL");
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamCoordinator, setTeamCoordinator] = useState("");
  const [teamRequestsPerMonth, setTeamRequestsPerMonth] = useState("");
  const [teamWindow, setTeamWindow] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [facilityCount, setFacilityCount] = useState("");
  const [corporateCoordinator, setCorporateCoordinator] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [complianceChecklist, setComplianceChecklist] = useState(false);
  const [unitCount, setUnitCount] = useState(1);
  const [areaSqft, setAreaSqft] = useState("");
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
          setSelectedCategory(null);
          setSelectedSubCategory(null);
          return;
        }
        setSelectedCategory(selectedCategory);
        setSelectedBusinessLevel(selectedCategory.businessLevel || "INDIVIDUAL");

        const subCategories = await fetchPublicSubCategories({
          categoryId: selectedCategory._id,
        });
        const list = Array.isArray(subCategories) ? subCategories : [];
        const selectedSub = list.find(
          (sub) => sub._id === packageId || sub.slug === packageId
        );

        if (!selectedSub?._id) {
          setServiceUnavailable(true);
          setSelectedSubCategory(null);
          return;
        }

        setSelectedSubCategory(selectedSub);
        setResolvedSubCategoryRef(selectedSub._id);
      } catch (error) {
        console.error("Failed to resolve booking service", error);
        setServiceUnavailable(true);
        setSelectedCategory(null);
        setSelectedSubCategory(null);
      }
    };

    resolveBookingService();
  }, [packageId, serviceSlug]);

  const pricingModel = useMemo(() => {
    const configuredModel =
      selectedSubCategory?.pricingModel || selectedCategory?.pricingModel || "";
    if (["STANDARD", "QUANTITY_BASED", "AREA_BASED"].includes(configuredModel)) {
      return configuredModel;
    }

    if (
      isAreaBasedService({
        category: selectedCategory,
        subCategory: selectedSubCategory,
        serviceSlug,
        packageId,
      })
    ) {
      return "AREA_BASED";
    }

    if (
      isQuantityBasedService({
        category: selectedCategory,
        subCategory: selectedSubCategory,
        serviceSlug,
        packageId,
      })
    ) {
      return "QUANTITY_BASED";
    }

    return "STANDARD";
  }, [selectedCategory, selectedSubCategory, serviceSlug, packageId]);

  const pricingUnitType = useMemo(() => {
    const configuredType =
      selectedSubCategory?.pricingUnitType || selectedCategory?.pricingUnitType || "";
    return configuredType === "SQFT" ? "SQFT" : "UNIT";
  }, [selectedSubCategory, selectedCategory]);

  const normalizedUnits = useMemo(() => {
    const parsed = Number(unitCount);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.min(20, Math.floor(parsed));
  }, [unitCount]);

  const normalizedAreaSqft = useMemo(() => {
    const parsed = Number(areaSqft);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.min(100000, Math.round(parsed));
  }, [areaSqft]);

  const configuredRate = useMemo(() => {
    const subRate = Number(selectedSubCategory?.pricingRate ?? 0);
    if (Number.isFinite(subRate) && subRate > 0) return subRate;
    const categoryRate = Number(selectedCategory?.pricingRate ?? 0);
    if (Number.isFinite(categoryRate) && categoryRate > 0) return categoryRate;
    return 0;
  }, [selectedSubCategory, selectedCategory]);

  const appliedRate = useMemo(() => {
    if (configuredRate > 0) return configuredRate;

    if (pricingModel === "AREA_BASED") {
      return 20;
    }
    if (pricingModel === "QUANTITY_BASED") {
      return PRICE_MAP[packageId] || 499;
    }
    return PRICE_MAP[packageId] || 299;
  }, [packageId, pricingModel, configuredRate]);

  const standardBasePrice = useMemo(() => {
    const subBasePrice = Number(selectedSubCategory?.basePrice ?? 0);
    if (Number.isFinite(subBasePrice) && subBasePrice > 0) {
      return subBasePrice;
    }
    return PRICE_MAP[packageId] || 299;
  }, [selectedSubCategory, packageId]);

  const basePrice = useMemo(() => {
    if (pricingModel === "AREA_BASED") {
      return normalizedAreaSqft * appliedRate;
    }
    if (pricingModel === "QUANTITY_BASED") {
      return normalizedUnits * appliedRate;
    }
    return standardBasePrice;
  }, [pricingModel, normalizedAreaSqft, normalizedUnits, appliedRate, standardBasePrice]);

  const serviceFee = useMemo(() => {
    const map = { INDIVIDUAL: 49, SMALL_TEAM: 99, ENTERPRISE: 199 };
    return map[selectedBusinessLevel] || 49;
  }, [selectedBusinessLevel]);
  const tax = Math.round(basePrice * 0.05);
  const total = basePrice + serviceFee + tax;
  const pricingModeLabel = useMemo(() => {
    if (pricingModel === "AREA_BASED") {
      return t("area_based_pricing", { defaultValue: "Area-based pricing" });
    }
    if (pricingModel === "QUANTITY_BASED") {
      return t("quantity_based_pricing", { defaultValue: "Unit-based pricing" });
    }
    return t("standard_pricing", { defaultValue: "Standard package pricing" });
  }, [pricingModel, t]);
  const levelLabel = useMemo(() => {
    if (selectedBusinessLevel === "ENTERPRISE") return "Enterprise";
    if (selectedBusinessLevel === "SMALL_TEAM") return "Small Team";
    return "Individual";
  }, [selectedBusinessLevel]);

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
    if (pricingModel === "AREA_BASED" && normalizedAreaSqft <= 0) {
      alert(t("enter_valid_area", { defaultValue: "Please enter a valid area in sq ft." }));
      return;
    }
    if (pricingModel === "QUANTITY_BASED" && normalizedUnits <= 0) {
      alert(t("enter_valid_quantity", { defaultValue: "Please enter a valid quantity." }));
      return;
    }
    if (selectedBusinessLevel === "SMALL_TEAM") {
      if (!teamName.trim() || !teamCoordinator.trim()) {
        alert("Please fill team name and coordinator details.");
        return;
      }
    }
    if (selectedBusinessLevel === "ENTERPRISE") {
      if (!companyName.trim() || !facilityType.trim() || !corporateCoordinator.trim()) {
        alert("Please fill company, facility type, and coordinator details.");
        return;
      }
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
        priceBreakdown: {
          basePrice,
          platformFee: serviceFee,
          tax,
          total,
          currency: "INR",
        },
        bookingContext: {
          businessLevel: selectedBusinessLevel,
          landmark: landmark.trim(),
          specialInstructions: specialInstructions.trim(),
          serviceMetrics: {
            pricingModel,
            quantity: pricingModel === "QUANTITY_BASED" ? normalizedUnits : 1,
            areaSqft: pricingModel === "AREA_BASED" ? normalizedAreaSqft : 0,
            ratePerUnit: appliedRate,
            unitType: pricingModel === "AREA_BASED" ? "SQFT" : pricingUnitType,
          },
          smallTeam: {
            teamName: teamName.trim(),
            coordinator: teamCoordinator.trim(),
            requestsPerMonth: Number(teamRequestsPerMonth || 0),
            preferredWindow: teamWindow.trim(),
          },
          enterprise: {
            companyName: companyName.trim(),
            facilityType: facilityType.trim(),
            facilityCount: Number(facilityCount || 0),
            coordinator: corporateCoordinator.trim(),
            poNumber: poNumber.trim(),
            complianceChecklistRequired: complianceChecklist,
          },
        },
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
          <div className="mt-3 inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {t("booking_mode", { defaultValue: "Booking Mode" })}: {levelLabel} | {pricingModeLabel}
          </div>
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

            {pricingModel === "QUANTITY_BASED" ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">
                    {t("quantity", { defaultValue: "Quantity" })}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={unitCount}
                    onChange={(e) => setUnitCount(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    placeholder={t("enter_units", { defaultValue: "e.g. 2" })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">
                    {t("rate_per_unit", { defaultValue: "Rate per Unit" })}
                  </label>
                  <input
                    disabled
                    value={`Rs ${appliedRate}`}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                  />
                </div>
              </div>
            ) : null}

            {pricingModel === "AREA_BASED" ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">
                    {t("area_sqft", { defaultValue: "Area (sq ft)" })}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    placeholder={t("enter_area_sqft", { defaultValue: "e.g. 450" })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">
                    {t("rate_per_sqft", { defaultValue: "Rate per sq ft" })}
                  </label>
                  <input
                    disabled
                    value={`Rs ${appliedRate}`}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                  />
                </div>
              </div>
            ) : null}

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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">Landmark (optional)</label>
                <input
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Special Instructions (optional)</label>
                <input
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                />
              </div>
            </div>

            {selectedBusinessLevel === "SMALL_TEAM" ? (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Small Team Requirements</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-600">Team / Business Name</label>
                    <input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Coordinator Name / Phone</label>
                    <input
                      value={teamCoordinator}
                      onChange={(e) => setTeamCoordinator(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Expected Requests per Month</label>
                    <input
                      value={teamRequestsPerMonth}
                      onChange={(e) => setTeamRequestsPerMonth(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                      placeholder="e.g. 8"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Preferred Service Window</label>
                    <input
                      value={teamWindow}
                      onChange={(e) => setTeamWindow(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                      placeholder="e.g. Weekdays 10 AM - 5 PM"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {selectedBusinessLevel === "ENTERPRISE" ? (
              <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Enterprise Requirements</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-600">Company Name</label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Facility Type</label>
                    <input
                      value={facilityType}
                      onChange={(e) => setFacilityType(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                      placeholder="e.g. Office / Campus / Plant"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">No. of Facilities / Blocks</label>
                    <input
                      value={facilityCount}
                      onChange={(e) => setFacilityCount(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                      placeholder="e.g. 4"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Coordinator Name / Phone</label>
                    <input
                      value={corporateCoordinator}
                      onChange={(e) => setCorporateCoordinator(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">PO Number (optional)</label>
                    <input
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    />
                  </div>
                  <label className="mt-5 inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={complianceChecklist}
                      onChange={(e) => setComplianceChecklist(e.target.checked)}
                    />
                    Compliance checklist required before closure
                  </label>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="rounded-2xl border bg-white p-5 h-fit">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("price_breakup", { defaultValue: "Price Breakup" })}
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              {pricingModel === "QUANTITY_BASED" ? (
                <Row
                  label={t("quantity", { defaultValue: "Quantity" })}
                  value={`${normalizedUnits} ${t("units", { defaultValue: "units" })}`}
                />
              ) : null}
              {pricingModel === "AREA_BASED" ? (
                <Row
                  label={t("area_sqft", { defaultValue: "Area (sq ft)" })}
                  value={`${normalizedAreaSqft} sq ft`}
                />
              ) : null}
              {(pricingModel === "AREA_BASED" || pricingModel === "QUANTITY_BASED") ? (
                <Row
                  label={
                    pricingModel === "AREA_BASED"
                      ? t("rate_per_sqft", { defaultValue: "Rate per sq ft" })
                      : t("rate_per_unit", { defaultValue: "Rate per Unit" })
                  }
                  value={`Rs ${appliedRate}`}
                />
              ) : null}
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
            <p className="mt-3 text-xs text-slate-500">
              {selectedBusinessLevel === "ENTERPRISE"
                ? "Enterprise mode includes priority dispatch and coordination overhead."
                : selectedBusinessLevel === "SMALL_TEAM"
                ? "Small Team mode includes coordination support."
                : "Individual mode uses standard support pricing."}
            </p>
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

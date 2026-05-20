"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useVehicles } from "@/hooks/useBooking";
import { useRides } from "@/hooks/useRides";
import { authClient } from "@/lib/auth-client";
import { forwardGeocode, reverseGeocode, getRouteDistance, type GeoResult } from "@/utils/geocoding";
import { filterVehicles, getVehicleFare, formatFare } from "@/data/booking.mock";
import { getServiceConfig } from "@/data/serviceConfig";
import type { BookingInitialData, TripTab, Vehicle } from "@/types/booking.types";
import { createBooking, createPaymentOrder, verifyPayment } from "@/api/booking.api";
import dynamic from "next/dynamic";
const LocationPickerMap = dynamic(
  () => import("@/components/map/LocationPickerMap").then((m) => m.LocationPickerMap),
  { ssr: false }
);
import {
  IconX, IconChevronLeft, IconMapPin, IconCar, IconCheck, IconCheckCircle,
  IconCalendar, IconClock, IconWind, IconUsers, IconRoundTrip, IconPlane,
  IconArrowLeftRight, IconLoader, IconLocate,
} from "@/constants/icons";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BookRideModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  onBooked:    () => void;
  initialData?: BookingInitialData;
}

interface FormState {
  // Common
  pickup:          string;
  pickupLat:       number | null;
  pickupLng:       number | null;
  destination:     string;
  destinationLat:  number | null;
  destinationLng:  number | null;
  date:            string;
  time:            string;
  tripTab:         TripTab;
  returnDate:      string;
  // Airport / Railway
  direction:    "to" | "from";
  refNumber:    string;   // flight no. or train no.
  // Hire
  duration:     string;
  endDate:      string;
  // Event / Group
  passengers:   string;
  notes:        string;
  // Inquiry
  inqName:      string;
  inqPhone:     string;
  inqOrg:       string;
  inqMessage:   string;
}

const BLANK_FORM: FormState = {
  pickup: "", pickupLat: null, pickupLng: null,
  destination: "", destinationLat: null, destinationLng: null,
  date: "", time: "",
  tripTab: "oneway", returnDate: "",
  direction: "to", refNumber: "",
  duration: "", endDate: "",
  passengers: "", notes: "",
  inqName: "", inqPhone: "", inqOrg: "", inqMessage: "",
};

const TRIP_TABS: { id: TripTab; label: string }[] = [
  { id: "oneway",    label: "One Way"    },
  { id: "roundtrip", label: "Round Trip" },
];

const SEAT_OPTIONS = [
  { label: "Any", value: 0  },
  { label: "4",   value: 4  },
  { label: "6",   value: 6  },
  { label: "7+",  value: 7  },
  { label: "12",  value: 12 },
];

// ── Main modal ────────────────────────────────────────────────────────────────

export function BookRideModal({ isOpen, onClose, onBooked, initialData }: BookRideModalProps) {
  const config    = initialData?.serviceId ? getServiceConfig(initialData.serviceId) : undefined;
  const isInquiry = config?.formType === "inquiry";
  const { data: session } = authClient.useSession();

  const [step,      setStep]      = useState<1 | 2 | 3>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [error,     setError]     = useState("");

  // Step 1 form state
  const [form, setForm] = useState<FormState>(() => seedForm(initialData));
  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateLocation = (
    field: "pickup" | "destination",
    value: string,
    lat?: number | null,
    lng?: number | null,
  ) => setForm((prev) => ({
    ...prev,
    [field]:               value,
    [`${field}Lat`]:       lat  ?? null,
    [`${field}Lng`]:       lng  ?? null,
  }));

  // Step 2 preferences + distance fare
  const [acPref,      setAcPref]      = useState<boolean | null>(null);
  const [seatFilter,  setSeatFilter]  = useState(0);
  const [vehicle,     setVehicle]     = useState("");
  const [distanceKm,  setDistanceKm]  = useState<number | null>(null);
  const [distLoading, setDistLoading] = useState(false);

  // Step 3 payment
  const [payProcessing, setPayProcessing] = useState(false);
  const [payMode,       setPayMode]       = useState<"full" | "partial" | null>(null);

  // Re-seed when modal reopens with new data
  useEffect(() => {
    setForm(seedForm(initialData));
    setStep(1);
    setError("");
    setAcPref(null);
    setSeatFilter(0);
    setVehicle("");
    setDistanceKm(null);
    setDistLoading(false);
    setPayProcessing(false);
    setPayMode(null);
    setConfirmed(false);
  }, [initialData]);

  const { data: allVehicles = [] } = useVehicles();

  const filteredVehicles = useMemo(() => {
    const allowedCategories = config?.vehicleCategories?.length
      ? config.vehicleCategories
      : undefined;
    return filterVehicles(
      allVehicles,
      config?.serviceTab ?? "local",
      acPref,
      seatFilter,
      allowedCategories,
      config?.id
    );
  }, [allVehicles, config, acPref, seatFilter]);

  // Pre-select vehicle by category when landing on step 2
  useEffect(() => {
    if (step === 2 && initialData?.preselectedCategory) {
      const match = filteredVehicles.find(
        (v) => v.category === initialData.preselectedCategory
      );
      if (match) setVehicle(match.type);
    }
  }, [step, filteredVehicles, initialData?.preselectedCategory]);

  // Distance-based fare: calculate when entering Step 2.
  // If explicit coords are missing (user typed without selecting autocomplete),
  // forward-geocode the text first so we still get a distance.
  useEffect(() => {
    if (step !== 2) return;
    if (!form.pickup.trim() || !form.destination.trim()) return;

    let cancelled = false;
    const run = async () => {
      setDistLoading(true);
      setDistanceKm(null);

      let pLat = form.pickupLat, pLng = form.pickupLng;
      let dLat = form.destinationLat, dLng = form.destinationLng;

      // Geocode if coords are missing
      if (!pLat || !pLng) {
        const r = await forwardGeocode(form.pickup);
        if (r[0]) { pLat = r[0].lat; pLng = r[0].lng; }
      }
      if (!dLat || !dLng) {
        const r = await forwardGeocode(form.destination);
        if (r[0]) { dLat = r[0].lat; dLng = r[0].lng; }
      }

      if (cancelled || !pLat || !pLng || !dLat || !dLng) {
        setDistLoading(false);
        return;
      }

      const d = await getRouteDistance(pLat, pLng, dLat, dLng);
      if (!cancelled) { setDistanceKm(d); setDistLoading(false); }
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, form.pickup, form.destination]);

  // Load Razorpay checkout.js once on mount
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(s);
    return () => { try { document.body.removeChild(s); } catch { /* already removed */ } };
  }, []);

  // Minimum seats required based on passenger count entered in Step 1
  const minPassengerSeats = parseMinSeats(form.passengers);

  const selectedV = filteredVehicles.find((v) => v.type === vehicle);

  function handleClose() {
    setForm(BLANK_FORM);
    setStep(1); setError(""); setAcPref(null);
    setSeatFilter(0); setVehicle(""); setDistanceKm(null);
    setPayProcessing(false); setPayMode(null); setConfirmed(false);
    onClose();
  }

  function handleStep1Next() {
    const err = validateStep1(form, config?.formType);
    if (err) { setError(err); return; }
    setError("");
    if (isInquiry) {
      submitInquiry();
    } else {
      // If a seat filter was previously set but is now below the passenger minimum, reset it
      const minSeats = parseMinSeats(form.passengers);
      if (minSeats > 0 && seatFilter > 0 && seatFilter < minSeats) {
        setSeatFilter(0);
      }
      setStep(2);
    }
  }

  function submitInquiry() {
    // Inquiry path — show confirmation without vehicle/payment steps
    setConfirmed(true);
    setTimeout(() => { handleClose(); onBooked(); }, 2000);
  }

  // Computed fare: per-km × road distance, or static for flat/hire fares
  const computedFare = useMemo(() => {
    if (!selectedV) return 0;
    const baseFare = getVehicleFare(selectedV, config?.id);
    if (baseFare.unit === "per km" && distanceKm != null) {
      return Math.ceil(distanceKm * baseFare.amount);
    }
    return baseFare.amount;
  }, [selectedV, distanceKm, config]);

  async function handleRazorpayPay(mode: "full" | "partial") {
    if (!selectedV || computedFare === 0) return;
    const amount = mode === "full" ? computedFare : calcAdvance(computedFare);

    setPayMode(mode);
    setPayProcessing(true);
    setError("");

    // 1. Create booking
    let bookingResult: { bookingId: string };
    try {
      bookingResult = await createBooking({
        serviceId:     config?.id ?? "city-taxi",
        serviceTab:    config?.serviceTab ?? "local",
        tripTab:       form.tripTab,
        pickup:        form.pickup      || "Current Location",
        pickupLat:     form.pickupLat   ?? undefined,
        pickupLng:     form.pickupLng   ?? undefined,
        dropoff:       form.destination || "Destination",
        dropLat:       form.destinationLat ?? undefined,
        dropLng:       form.destinationLng ?? undefined,
        date:          form.date,
        time:          form.time,
        returnDate:    form.tripTab === "roundtrip" ? form.returnDate : undefined,
        vehicleType:   vehicle,
        ac:            selectedV.ac,
        seats:         selectedV.seats,
        payment:       "razorpay",
        customerName:  session?.user?.name  ?? "Guest",
        customerPhone: session?.user?.phoneNumber ?? "",
        totalFare:     String(computedFare),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking. Please try again.");
      setPayProcessing(false);
      setPayMode(null);
      return;
    }

    // 2. Create Razorpay order
    let orderData: { orderId: string; amount: number; currency: string; keyId: string };
    try {
      const orderRes = await createPaymentOrder(bookingResult.bookingId, amount, mode);
      orderData = orderRes.data;
    } catch {
      setError("Failed to initiate payment. Please try again.");
      setPayProcessing(false);
      setPayMode(null);
      return;
    }

    // 3. Open Razorpay checkout
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay({
      key:         orderData.keyId,
      order_id:    orderData.orderId,
      amount:      orderData.amount,
      currency:    orderData.currency,
      name:        "Mohan Cabs",
      description: mode === "full" ? "Full Payment" : "Advance Payment",
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          await verifyPayment(
            bookingResult.bookingId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          );
          setConfirmed(true);
          setTimeout(() => { handleClose(); onBooked(); }, 1800);
        } catch {
          setError("Payment verification failed. Please contact support.");
        }
      },
      modal: {
        ondismiss: () => { setPayProcessing(false); setPayMode(null); },
      },
      prefill: {
        name:    session?.user?.name    ?? "",
        contact: session?.user?.phoneNumber ?? "",
      },
    });
    rzp.open();
    setPayProcessing(false);
  }

  if (!isOpen) return null;

  const stepLabel = isInquiry
    ? "Send Enquiry"
    : step === 1 ? "Your Details"
    : step === 2 ? "Choose Vehicle"
    : "Confirm Booking";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* ── Confirmation ──────────────────────────────────────────── */}
        {confirmed ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-success-light)] flex items-center justify-center">
              <IconCheckCircle size={32} className="text-[var(--color-success)]" />
            </div>
            <p className="text-[20px] font-black text-[var(--color-text-primary)]">
              {isInquiry ? "Enquiry Sent!" : "Ride Booked!"}
            </p>
            <p className="text-[13px] text-[var(--color-text-tertiary)]">
              {isInquiry
                ? "We'll get back to you shortly."
                : "Looking for a driver nearby…"}
            </p>
            {!isInquiry && form.pickup && (
              <div className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[13px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5">
                <IconMapPin size={13} /> {form.pickup}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button
                    onClick={() => { setStep((s) => (s - 1) as 1 | 2 | 3); setError(""); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] mr-1"
                  >
                    <IconChevronLeft size={16} />
                  </button>
                )}
                <div>
                  <p className="text-[16px] font-black text-[var(--color-text-primary)]">
                    {stepLabel}
                  </p>
                  {config && (
                    <p className="text-[11px] font-semibold text-[var(--color-primary)] mt-0.5">
                      {config.label}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Step dots — 3 for full flow, 1 for inquiry */}
                {!isInquiry && (
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                          s === step
                            ? "w-5 bg-[var(--color-primary)]"
                            : s < step
                            ? "w-1.5 bg-[var(--color-primary)] opacity-40"
                            : "w-1.5 bg-[var(--color-border-strong)]"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-[var(--color-surface-muted)]">
                  <IconX size={15} />
                </button>
              </div>
            </div>

            {/* ── Scrollable body ───────────────────────────────────── */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* ── Step 1: Service-specific form ──────────────────── */}
              {step === 1 && (
                <Step1Form
                  formType={config?.formType ?? "standard"}
                  serviceId={config?.id}
                  form={form}
                  update={update}
                  updateLocation={updateLocation}
                  error={error}
                />
              )}

              {/* ── Step 2: Preferences + Vehicles ─────────────────── */}
              {step === 2 && (
                <>
                  {/* Route summary */}
                  <RouteSummary form={form} config={config} />

                  {/* AC preference */}
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">AC Preference</p>
                    <div className="flex gap-2">
                      {[
                        { label: "AC",     val: true  as boolean | null, icon: true },
                        { label: "Non-AC", val: false as boolean | null, icon: false },
                        { label: "Any",    val: null  as boolean | null, icon: false },
                      ].map(({ label, val, icon }) => (
                        <button
                          key={label}
                          onClick={() => { setAcPref(val); setVehicle(""); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                            acPref === val
                              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                              : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                          }`}
                        >
                          {icon && <IconWind size={12} />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seat filter */}
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Minimum Seats</p>
                    <div className="flex gap-2 flex-wrap">
                      {SEAT_OPTIONS.map(({ label, value }) => {
                        const tooFew = value > 0 && minPassengerSeats > 0 && value < minPassengerSeats;
                        return (
                          <button
                            key={label}
                            disabled={tooFew}
                            onClick={() => { if (!tooFew) { setSeatFilter(value); setVehicle(""); } }}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                              tooFew
                                ? "opacity-35 cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-tertiary)] border-[var(--color-border)]"
                                : seatFilter === value
                                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                            }`}
                          >
                            {value > 0 && <IconUsers size={11} />}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vehicle list */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">Available Vehicles</p>
                      {distLoading && (
                        <span className="flex items-center gap-1 text-[10px] text-[var(--color-primary)] font-semibold">
                          <IconLoader size={10} className="animate-spin" /> Calculating fare…
                        </span>
                      )}
                      {!distLoading && distanceKm != null && (
                        <span className="text-[10px] text-[var(--color-primary)] font-semibold bg-[var(--color-primary-light)] px-2 py-0.5 rounded-full">
                          {distanceKm} km route
                        </span>
                      )}
                    </div>
                    {filteredVehicles.length === 0 ? (
                      <div className="text-center py-8 text-[13px] text-[var(--color-text-tertiary)]">
                        No vehicles match these filters.
                        <br />Try changing AC preference or seat count.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredVehicles.map((v) => (
                          <VehicleCard
                            key={v.type}
                            vehicle={v}
                            selected={vehicle === v.type}
                            onSelect={() => setVehicle(v.type)}
                            serviceId={config?.id}
                            disabled={minPassengerSeats > 0 && v.seats < minPassengerSeats}
                            distanceKm={distanceKm}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Step 3: Payment ─────────────────────────────────── */}
              {step === 3 && selectedV && (
                <>
                  <RouteSummary form={form} config={config} />

                  {/* Vehicle summary */}
                  <div className="flex items-center gap-4 px-4 py-3 bg-[var(--color-primary-light)] rounded-xl border border-[var(--color-primary)]/20">
                    <IconCar size={20} className="text-[var(--color-primary)]" />
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-[var(--color-text-primary)]">{selectedV.type}</p>
                      <p className="text-[12px] text-[var(--color-text-tertiary)]">
                        {selectedV.seats} seats · {selectedV.ac ? "AC" : "Non-AC"} · {selectedV.desc}
                        {distanceKm != null && ` · ${distanceKm} km`}
                      </p>
                    </div>
                    <p className="text-[15px] font-black text-[var(--color-primary)]">
                      ₹{computedFare}
                    </p>
                  </div>

                  {/* Fare breakdown */}
                  <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                      <span className="text-[13px] text-[var(--color-text-secondary)]">Total Fare</span>
                      <span className="text-[16px] font-black text-[var(--color-text-primary)]">₹{computedFare}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface-muted)]">
                      <div>
                        <span className="text-[13px] text-[var(--color-text-secondary)]">Advance (Partial Pay)</span>
                        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                          Balance ₹{computedFare - calcAdvance(computedFare)} paid to driver on arrival
                        </p>
                      </div>
                      <span className="text-[15px] font-bold text-[var(--color-primary)]">₹{calcAdvance(computedFare)}</span>
                    </div>
                  </div>

                  {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
                </>
              )}
            </div>

            {/* ── Footer CTA ────────────────────────────────────────── */}
            <div className="px-5 pb-5 pt-3 border-t border-[var(--color-border)] shrink-0">
              {step === 1 && (
                <Button
                  onPress={handleStep1Next}
                  className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 rounded-xl"
                >
                  {isInquiry ? "Send Enquiry" : "See Available Cabs →"}
                </Button>
              )}
              {step === 2 && (
                <Button
                  onPress={() => setStep(3)}
                  isDisabled={!vehicle}
                  className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 rounded-xl disabled:opacity-50"
                >
                  Continue →
                </Button>
              )}
              {step === 3 && (
                <div className="flex gap-2">
                  <Button
                    onPress={() => handleRazorpayPay("partial")}
                    isDisabled={payProcessing}
                    isLoading={payProcessing && payMode === "partial"}
                    className="flex-1 bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] font-bold py-3 rounded-xl border border-[var(--color-border)] text-[13px]"
                  >
                    Pay ₹{computedFare > 0 ? calcAdvance(computedFare) : "…"} Advance
                  </Button>
                  <Button
                    onPress={() => handleRazorpayPay("full")}
                    isDisabled={payProcessing}
                    isLoading={payProcessing && payMode === "full"}
                    className="flex-1 bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl text-[13px]"
                  >
                    Pay ₹{computedFare > 0 ? computedFare : "…"} Now
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Form type renderer ────────────────────────────────────────────────

type UpdateLocationFn = (field: "pickup" | "destination", value: string, lat?: number | null, lng?: number | null) => void;

interface Step1Props {
  formType: string;
  serviceId?: string;
  form: FormState;
  update: (field: keyof FormState, value: string) => void;
  updateLocation: UpdateLocationFn;
  error: string;
}

function Step1Form({ formType, serviceId, form, update, updateLocation, error }: Step1Props) {
  switch (formType) {
    case "outstation": return <OutstationForm form={form} update={update} updateLocation={updateLocation} error={error} />;
    case "airport":    return <AirportForm    form={form} update={update} updateLocation={updateLocation} error={error} />;
    case "railway":    return <RailwayForm    form={form} update={update} updateLocation={updateLocation} error={error} />;
    case "hire":       return <HireForm       form={form} update={update} updateLocation={updateLocation} error={error} serviceId={serviceId} />;
    case "event":      return <EventForm      form={form} update={update} updateLocation={updateLocation} error={error} />;
    case "group":      return <GroupForm      form={form} update={update} updateLocation={updateLocation} error={error} />;
    case "inquiry":    return <InquiryForm    form={form} update={update} updateLocation={updateLocation} error={error} />;
    default:           return <StandardForm   form={form} update={update} updateLocation={updateLocation} error={error} />;
  }
}

// ── Form variants ─────────────────────────────────────────────────────────────

interface FormProps {
  form: FormState;
  update: (field: keyof FormState, value: string) => void;
  updateLocation: UpdateLocationFn;
  error: string;
}

// Standard: City Taxi, Nationwide
function StandardForm({ form, update, updateLocation, error }: FormProps) {
  return (
    <>
      <TripToggle value={form.tripTab} onChange={(v) => update("tripTab", v)} />
      <LocationInput label="Pickup Location" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="Enter pickup location" highlight={!!error && !form.pickup.trim()} />
      <DateTimeRow date={form.date} time={form.time} onDate={(v) => update("date", v)} onTime={(v) => update("time", v)} />
      <LocationInput label="Destination" dotClass="rounded bg-[var(--color-text-primary)]"
        value={form.destination} onChange={(v, lat, lng) => updateLocation("destination", v, lat, lng)}
        placeholder="Enter destination" highlight={!!error && !form.destination.trim()} />
      {form.tripTab === "roundtrip" && (
        <ReturnDateInput value={form.returnDate} onChange={(v) => update("returnDate", v)} />
      )}
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Outstation: from city → to city
function OutstationForm({ form, update, updateLocation, error }: FormProps) {
  return (
    <>
      <TripToggle value={form.tripTab} onChange={(v) => update("tripTab", v)} />
      <LocationInput label="Departure City" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="E.g. Trivandrum" highlight={!!error && !form.pickup.trim()} />
      <LocationInput label="Destination City" dotClass="rounded bg-[var(--color-text-primary)]"
        value={form.destination} onChange={(v, lat, lng) => updateLocation("destination", v, lat, lng)}
        placeholder="E.g. Kochi, Bangalore…" highlight={!!error && !form.destination.trim()} />
      <DateTimeRow label="Journey Date & Time"
        date={form.date} time={form.time} onDate={(v) => update("date", v)} onTime={(v) => update("time", v)} />
      {form.tripTab === "roundtrip" && (
        <ReturnDateInput value={form.returnDate} onChange={(v) => update("returnDate", v)} />
      )}
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Airport Transfer
function AirportForm({ form, update, updateLocation, error }: FormProps) {
  return (
    <>
      {/* Direction */}
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Direction</p>
        <div className="flex gap-2">
          {[
            { val: "to",   label: "To Airport",   icon: <IconPlane size={13} /> },
            { val: "from", label: "From Airport",  icon: <IconArrowLeftRight size={13} /> },
          ].map(({ val, label, icon }) => (
            <button key={val} onClick={() => update("direction", val)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                form.direction === val
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
              }`}>
              {icon}{label}
            </button>
          ))}
        </div>
      </div>
      <LocationInput
        label={form.direction === "to" ? "Your Pickup Address" : "Airport Terminal"}
        dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder={form.direction === "to" ? "Home / Office address" : "E.g. Terminal 1"}
        highlight={!!error && !form.pickup.trim()} />
      <DateTimeRow label="Flight Date & Time"
        date={form.date} time={form.time} onDate={(v) => update("date", v)} onTime={(v) => update("time", v)} />
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Flight Number <span className="normal-case font-medium">(optional)</span></p>
        <FieldInput value={form.refNumber} onChange={(v) => update("refNumber", v)} placeholder="E.g. 6E 204" />
      </div>
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Railway Transfer
function RailwayForm({ form, update, updateLocation, error }: FormProps) {
  return (
    <>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Direction</p>
        <div className="flex gap-2">
          {[
            { val: "to",   label: "To Station"   },
            { val: "from", label: "From Station" },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => update("direction", val)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                form.direction === val
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
              }`}>{label}</button>
          ))}
        </div>
      </div>
      <LocationInput
        label={form.direction === "to" ? "Your Pickup Address" : "Station Name"}
        dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder={form.direction === "to" ? "Home / Office address" : "E.g. Trivandrum Central"}
        highlight={!!error && !form.pickup.trim()} />
      <DateTimeRow label="Train Date & Time"
        date={form.date} time={form.time} onDate={(v) => update("date", v)} onTime={(v) => update("time", v)} />
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Train Number <span className="normal-case font-medium">(optional)</span></p>
        <FieldInput value={form.refNumber} onChange={(v) => update("refNumber", v)} placeholder="E.g. 12625" />
      </div>
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Hire: Full Day, Weekly Commute, Rent a Car
function HireForm({ form, update, updateLocation, error, serviceId }: FormProps & { serviceId?: string }) {
  const isWeekly  = serviceId === "weekly-commute";
  const isRentCar = serviceId === "rent-a-car";

  return (
    <>
      <LocationInput label="Pickup Location" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="Your pickup address" highlight={!!error && !form.pickup.trim()} />
      <DateTimeRow label="Start Date & Time"
        date={form.date} time={form.time} onDate={(v) => update("date", v)} onTime={(v) => update("time", v)} />
      {isRentCar && (
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Return Date</p>
          <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 py-2.5 focus-within:border-[var(--color-primary)]">
            <IconCalendar size={14} className="text-[var(--color-text-tertiary)]" />
            <input type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)}
              className="flex-1 text-[13px] text-[var(--color-text-secondary)] outline-none bg-transparent" />
          </div>
        </div>
      )}
      {!isRentCar && (
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Duration</p>
          <div className="flex gap-2 flex-wrap">
            {(isWeekly ? ["5 Days", "7 Days"] : ["4 Hours", "8 Hours", "12 Hours"]).map((opt) => (
              <button key={opt} onClick={() => update("duration", opt)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                  form.duration === opt
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                }`}>{opt}</button>
            ))}
          </div>
        </div>
      )}
      {isWeekly && (
        <LocationInput label="Daily Destination (Office / Workplace)" dotClass="rounded bg-[var(--color-text-primary)]"
          value={form.destination} onChange={(v, lat, lng) => updateLocation("destination", v, lat, lng)}
          placeholder="Daily drop location" highlight={false} />
      )}
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Event: Wedding, Tours, Events
function EventForm({ form, update, updateLocation, error }: FormProps) {
  return (
    <>
      <DateTimeRow label="Event / Tour Date"
        date={form.date} time={form.time} onDate={(v) => update("date", v)} onTime={(v) => update("time", v)} />
      <LocationInput label="Pickup / Venue" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="Venue or pickup address" highlight={!!error && !form.pickup.trim()} />
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Duration</p>
        <div className="flex gap-2 flex-wrap">
          {["Half Day (4 hrs)", "Full Day (8 hrs)", "Multi-Day"].map((opt) => (
            <button key={opt} onClick={() => update("duration", opt)}
              className={`px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                form.duration === opt
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
              }`}>{opt}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Passengers</p>
        <PassengerSelect value={form.passengers} onChange={(v) => update("passengers", v)} options={["1–3", "4–6", "7–10", "10–15", "15+"]} />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Special Requests <span className="normal-case font-medium">(optional)</span></p>
        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)}
          rows={2} placeholder="Decoration, multiple vehicles, accessibility needs…"
          className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] bg-transparent outline-none resize-none focus:border-[var(--color-primary)]" />
      </div>
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Group: Tempo Traveller
function GroupForm({ form, update, updateLocation, error }: FormProps) {
  return (
    <>
      <TripToggle value={form.tripTab} onChange={(v) => update("tripTab", v)} />
      <LocationInput label="Pickup Location" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="Enter pickup location" highlight={!!error && !form.pickup.trim()} />
      <LocationInput label="Destination" dotClass="rounded bg-[var(--color-text-primary)]"
        value={form.destination} onChange={(v, lat, lng) => updateLocation("destination", v, lat, lng)}
        placeholder="Enter destination" highlight={!!error && !form.destination.trim()} />
      <DateTimeRow date={form.date} time={form.time} onDate={(v) => update("date", v)} onTime={(v) => update("time", v)} />
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">
          <span className="flex items-center gap-1"><IconUsers size={11} /> Passengers</span>
        </p>
        <PassengerSelect value={form.passengers} onChange={(v) => update("passengers", v)}
          options={["8", "9", "10", "12", "14", "16", "20"]} />
      </div>
      {form.tripTab === "roundtrip" && (
        <ReturnDateInput value={form.returnDate} onChange={(v) => update("returnDate", v)} />
      )}
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Inquiry: Corporate, School
function InquiryForm({ form, update, updateLocation, error }: FormProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Your Name</p>
          <FieldInput value={form.inqName} onChange={(v) => update("inqName", v)} placeholder="Full name"
            highlight={!!error && !form.inqName.trim()} />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Phone Number</p>
          <FieldInput value={form.inqPhone} onChange={(v) => update("inqPhone", v)} placeholder="9876543210"
            highlight={!!error && !form.inqPhone.trim()} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Company / School Name</p>
        <FieldInput value={form.inqOrg} onChange={(v) => update("inqOrg", v)} placeholder="Organisation name"
          highlight={!!error && !form.inqOrg.trim()} />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Requirements</p>
        <textarea value={form.inqMessage} onChange={(e) => update("inqMessage", e.target.value)}
          rows={4} placeholder="Describe your transport needs, number of employees/students, routes, schedule…"
          className={`w-full border rounded-xl px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] bg-transparent outline-none resize-none focus:border-[var(--color-primary)] ${
            error && !form.inqMessage.trim() ? "border-red-400" : "border-[var(--color-border)]"
          }`} />
      </div>
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// ── Reusable field components ─────────────────────────────────────────────────

function TripToggle({ value, onChange }: { value: TripTab; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-[var(--color-surface-muted)] rounded-xl">
      {TRIP_TABS.map(({ id, label }) => (
        <button key={id} onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold py-2 rounded-lg transition-colors ${
            value === id
              ? "bg-[var(--color-surface)] shadow-sm text-[var(--color-text-primary)]"
              : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
          }`}>
          {id === "roundtrip" && <IconRoundTrip size={11} />}
          {label}
        </button>
      ))}
    </div>
  );
}

function LocationInput({ label, dotClass, value, onChange, placeholder, highlight }: {
  label: string; dotClass: string; value: string;
  onChange: (v: string, lat?: number | null, lng?: number | null) => void;
  placeholder: string; highlight: boolean;
}) {
  const [showMap,      setShowMap]      = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions,  setSuggestions]  = useState<GeoResult[]>([]);
  const [loadingSug,   setLoadingSug]   = useState(false);
  const [locating,     setLocating]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recent places from ride history
  const { data: rides } = useRides();
  const recentPlaces = useMemo(() => {
    if (!rides) return [];
    const seen = new Set<string>();
    const places: string[] = [];
    for (const r of rides) {
      if (r.from && !seen.has(r.from)) { seen.add(r.from); places.push(r.from); }
      if (r.to   && !seen.has(r.to))   { seen.add(r.to);   places.push(r.to);   }
    }
    return places.slice(0, 5);
  }, [rides]);

  const handleChange = (val: string) => {
    onChange(val, null, null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoadingSug(true);
      const results = await forwardGeocode(val);
      setSuggestions(results);
      setLoadingSug(false);
    }, 350);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: pos }) => {
        const addr = await reverseGeocode(pos.latitude, pos.longitude);
        onChange(addr, pos.latitude, pos.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const showingRecent      = !value.trim() && recentPlaces.length > 0;
  const showingSuggestions = !!value.trim() && (suggestions.length > 0 || loadingSug);
  const dropdownVisible    = showDropdown && (showingRecent || showingSuggestions);

  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">{label}</p>

      <div className={`relative rounded-xl border transition-colors ${
        highlight ? "border-red-400" : "border-[var(--color-border)] focus-within:border-[var(--color-primary)]"
      }`}>
        <div className="flex items-center gap-2 px-3 py-2.5 pr-16">
          <div className={`w-2.5 h-2.5 shrink-0 ${dotClass}`} />
          <input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder={placeholder}
            className="flex-1 text-[14px] outline-none text-[var(--color-text-primary)] bg-transparent"
          />
          {/* Current location button */}
          <button
            type="button"
            onClick={handleLocate}
            title="Use current location"
            disabled={locating}
            className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] disabled:opacity-50"
          >
            {locating
              ? <IconLoader size={14} className="animate-spin" />
              : <IconLocate size={14} />}
          </button>
          {/* Map pin button */}
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            title="Pin on map"
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
              showMap ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
            }`}
          >
            <IconMapPin size={15} />
          </button>
        </div>

        {/* Dropdown */}
        {dropdownVisible && (
          <div className="absolute z-50 top-full mt-1 w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
            {showingRecent && (
              <>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">
                  Recent
                </p>
                {recentPlaces.map((place) => (
                  <button
                    key={place}
                    type="button"
                    onMouseDown={() => { onChange(place, null, null); setShowDropdown(false); }}
                    className="w-full flex items-start gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--color-border)]/30 transition-colors"
                  >
                    <IconClock size={13} className="mt-0.5 shrink-0 text-[var(--color-text-tertiary)]" />
                    <span className="line-clamp-1 text-[var(--color-text-primary)]">{place}</span>
                  </button>
                ))}
              </>
            )}
            {showingSuggestions && (
              <>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">
                  Suggestions
                </p>
                {loadingSug ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-text-tertiary)]">
                    <IconLoader size={13} className="animate-spin shrink-0" />
                    Searching…
                  </div>
                ) : (
                  suggestions.map((r) => (
                    <button
                      key={r.name}
                      type="button"
                      onMouseDown={() => { onChange(r.name, r.lat, r.lng); setSuggestions([]); setShowDropdown(false); }}
                      className="w-full flex items-start gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--color-border)]/30 transition-colors"
                    >
                      <IconMapPin size={13} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                      <span className="line-clamp-2 text-[var(--color-text-primary)]">{r.name}</span>
                    </button>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <LocationPickerMap
              initialAddress={value}
              onConfirm={(addr, coords) => { onChange(addr, coords?.lat, coords?.lng); setShowMap(false); }}
              onCancel={() => setShowMap(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DateTimeRow({ label, date, time, onDate, onTime }: {
  label?: string; date: string; time: string;
  onDate: (v: string) => void; onTime: (v: string) => void;
}) {
  return (
    <div>
      {label && <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">{label}</p>}
      {!label && <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Date &amp; Time</p>}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 py-2.5 focus-within:border-[var(--color-primary)]">
          <IconCalendar size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
          <input type="date" value={date} onChange={(e) => onDate(e.target.value)}
            className="flex-1 text-[13px] text-[var(--color-text-secondary)] outline-none bg-transparent w-full" />
        </div>
        <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 py-2.5 focus-within:border-[var(--color-primary)]">
          <IconClock size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
          <input type="time" value={time} onChange={(e) => onTime(e.target.value)}
            className="flex-1 text-[13px] text-[var(--color-text-secondary)] outline-none bg-transparent w-full" />
        </div>
      </div>
    </div>
  );
}

function ReturnDateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Return Date</p>
      <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 py-2.5 focus-within:border-[var(--color-primary)]">
        <IconCalendar size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-[13px] text-[var(--color-text-secondary)] outline-none bg-transparent w-full" />
      </div>
    </div>
  );
}

function FieldInput({ value, onChange, placeholder, highlight }: {
  value: string; onChange: (v: string) => void; placeholder: string; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center border rounded-xl px-3 py-2.5 focus-within:border-[var(--color-primary)] ${
      highlight ? "border-red-400" : "border-[var(--color-border)]"
    }`}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 text-[14px] outline-none text-[var(--color-text-primary)] bg-transparent" />
    </div>
  );
}

function PassengerSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
            value === opt
              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
          }`}>{opt}</button>
      ))}
    </div>
  );
}

function RouteSummary({ form, config }: { form: FormState; config?: { label: string } | undefined }) {
  return (
    <div className="bg-[var(--color-surface-muted)] rounded-xl p-3 text-[12px] space-y-1">
      {config && <p className="font-bold text-[var(--color-primary)]">{config.label}</p>}
      {form.pickup && (
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <span className="font-semibold">From</span>
          <span className="text-[var(--color-text-primary)]">{form.pickup}</span>
        </div>
      )}
      {form.destination && (
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <span className="font-semibold">To</span>
          <span className="text-[var(--color-text-primary)]">{form.destination}</span>
        </div>
      )}
      {(form.date || form.time) && (
        <p className="text-[var(--color-text-tertiary)]">{form.date}{form.time ? ` · ${form.time}` : ""}</p>
      )}
      {form.tripTab === "roundtrip" && form.returnDate && (
        <p className="text-[var(--color-text-tertiary)]">Return: {form.returnDate}</p>
      )}
    </div>
  );
}

function VehicleCard({ vehicle, selected, onSelect, serviceId, disabled, distanceKm }: {
  vehicle: Vehicle; selected: boolean; onSelect: () => void; serviceId?: string; disabled?: boolean;
  distanceKm?: number | null;
}) {
  const fare = getVehicleFare(vehicle, serviceId);
  const computedAmount = fare.unit === "per km" && distanceKm != null
    ? Math.ceil(distanceKm * fare.amount)
    : null;

  return (
    <button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left ${
        disabled
          ? "bg-[var(--color-surface-muted)] border-[var(--color-border)] opacity-50 cursor-not-allowed"
          : selected
          ? "bg-[var(--color-primary-light)] border-[var(--color-primary)]"
          : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
      }`}
    >
      <IconCar size={20} className={disabled ? "text-[var(--color-text-tertiary)]" : selected ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]"} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[var(--color-text-primary)] truncate">{vehicle.type}</p>
        <p className="text-[11px] text-[var(--color-text-tertiary)]">
          {vehicle.seats} seats · {vehicle.ac ? "AC" : "Non-AC"} · ETA {vehicle.eta}
          {disabled && <span className="ml-1.5 font-semibold text-red-400">· Insufficient seats</span>}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-[15px] font-black ${disabled ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-primary)]"}`}>
          {computedAmount != null ? `₹${computedAmount}` : formatFare(fare)}
        </p>
        {computedAmount != null && (
          <p className="text-[10px] text-[var(--color-text-tertiary)]">{formatFare(fare)}</p>
        )}
      </div>
      {selected && !disabled && (
        <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0">
          <IconCheck size={11} className="text-white" strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Advance amount for partial payment: ≤₹700 → 50%, >₹700 → fixed ₹500. */
function calcAdvance(fare: number): number {
  if (fare > 700) return 500;
  return Math.round(fare * 0.5);
}

/** Parse a passenger string like "8", "7–10", "15+" into a minimum seat count. */
function parseMinSeats(passengers: string): number {
  if (!passengers) return 0;
  if (passengers.endsWith("+")) return parseInt(passengers) || 0;
  // "7–10" or "7-10" → lower bound
  const parts = passengers.split(/[–\-]/);
  return parseInt(parts[0]) || 0;
}

function seedForm(initialData?: BookingInitialData): FormState {
  const config = initialData?.serviceId ? getServiceConfig(initialData.serviceId) : undefined;
  return {
    ...BLANK_FORM,
    pickup:          initialData?.pickup          ?? "",
    pickupLat:       initialData?.pickupLat       ?? null,
    pickupLng:       initialData?.pickupLng       ?? null,
    destination:     initialData?.destination     ?? "",
    destinationLat:  initialData?.destinationLat  ?? null,
    destinationLng:  initialData?.destinationLng  ?? null,
    date:            initialData?.date            ?? "",
    time:            initialData?.time            ?? "",
    returnDate:      initialData?.returnDate      ?? "",
    tripTab:         initialData?.tripTab ?? config?.defaultTripTab ?? "oneway",
  };
}

function validateStep1(form: FormState, formType?: string): string {
  switch (formType) {
    case "airport":
    case "railway":
      if (!form.pickup.trim()) return "Please enter your address.";
      if (!form.date) return "Please select a date.";
      if (!form.time) return "Please select a time.";
      return "";
    case "hire":
      if (!form.pickup.trim()) return "Please enter a pickup location.";
      if (!form.date) return "Please select a date.";
      if (!form.time) return "Please select a time.";
      return "";
    case "event":
      if (!form.pickup.trim()) return "Please enter the venue or pickup address.";
      if (!form.date) return "Please select a date.";
      if (!form.time) return "Please select a time.";
      return "";
    case "group":
      if (!form.pickup.trim() || !form.destination.trim()) return "Please enter pickup and destination.";
      if (!form.passengers) return "Please select the number of passengers.";
      if (!form.date) return "Please select a date.";
      if (!form.time) return "Please select a time.";
      return "";
    case "inquiry":
      if (!form.inqName.trim() || !form.inqPhone.trim()) return "Please enter your name and phone number.";
      if (!form.inqOrg.trim()) return "Please enter your organisation name.";
      if (!form.inqMessage.trim()) return "Please describe your requirements.";
      return "";
    default:
      if (!form.pickup.trim() || !form.destination.trim()) return "Please enter pickup and destination.";
      if (!form.date) return "Please select a date.";
      if (!form.time) return "Please select a time.";
      return "";
  }
}

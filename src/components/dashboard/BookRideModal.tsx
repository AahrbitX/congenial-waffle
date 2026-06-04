"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useVehicles } from "@/hooks/useBooking";
import { useRides } from "@/hooks/useRides";
import { authClient } from "@/lib/auth-client";
import {
  forwardGeocode,
  reverseGeocode,
  getRouteDistance,
  type GeoResult,
} from "@/utils/geocoding";
import {
  filterVehicles,
  getVehicleFare,
  formatFare,
} from "@/data/booking.mock";
import { getServiceConfig } from "@/data/serviceConfig";
import type {
  BookingInitialData,
  TripTab,
  Vehicle,
} from "@/types/booking.types";
import { createBooking, cancelBooking } from "@/api/booking.api";
import { createPaymentOrder, verifyPayment } from "@/api/transactions.api";
import dynamic from "next/dynamic";
const LocationPickerMap = dynamic(
  () =>
    import("@/components/map/LocationPickerMap").then(
      (m) => m.LocationPickerMap,
    ),
  { ssr: false },
);
import {
  IconX,
  IconChevronLeft,
  IconMapPin,
  IconCar,
  IconCheck,
  IconCheckCircle,
  IconCalendar,
  IconClock,
  IconWind,
  IconUsers,
  IconRoundTrip,
  IconPlane,
  IconArrowLeftRight,
  IconLoader,
  IconLocate,
} from "@/constants/icons";
import {
  FieldError,
  Input,
  Label,
  Modal,
  Tab,
  Tabs,
} from "@heroui/react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BookRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBooked: () => void;
  initialData?: BookingInitialData;
}

interface FormState {
  pickup: string;
  pickupLat: number | null;
  pickupLng: number | null;

  destination: string;
  destinationLat: number | null;
  destinationLng: number | null;

  date: string;
  time: string;
  returnDate: string;
  returnTime: string;

  // Type of Trip
  tripTab: TripTab;

  // Airport / Railway
  direction: "to" | "from";
  refNumber: string; // flight no. or train no.

  // Hire
  duration: string;
  endDate: string;

  // Event / Group
  passengers: string;
  notes: string;

  // Inquiry
  inqName: string;
  inqPhone: string;
  inqOrg: string;
  inqMessage: string;
}

const BLANK_FORM: FormState = {
  pickup: "",
  pickupLat: null,
  pickupLng: null,

  destination: "",
  destinationLat: null,
  destinationLng: null,

  date: "",
  time: "",
  returnDate: "",
  returnTime: "",

  tripTab: "oneway",

  direction: "to",
  refNumber: "",

  duration: "",
  endDate: "",

  passengers: "",
  notes: "",

  inqName: "",
  inqPhone: "",
  inqOrg: "",
  inqMessage: "",
};

const TRIP_TABS: { id: TripTab; label: string }[] = [
  { id: "oneway", label: "One Way" },
  { id: "roundtrip", label: "Round Trip" },
];

const SEAT_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "4", value: 4 },
  { label: "6", value: 6 },
  { label: "7+", value: 7 },
  { label: "12", value: 12 },
];

// ── Main modal ────────────────────────────────────────────────────────────────

export function BookRideModal({
  isOpen,
  onClose,
  onBooked,
  initialData,
}: BookRideModalProps) {
  const config = initialData?.serviceId
    ? getServiceConfig(initialData.serviceId)
    : undefined;
  const isInquiry = config?.formType === "inquiry";
  const { data: session } = authClient.useSession();
  const qc = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  // Step 1 form state
  const [form, setForm] = useState<FormState>(() => seedForm(initialData));
  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateLocation = (
    field: "pickup" | "destination",
    value: string,
    lat?: number | null,
    lng?: number | null,
  ) =>
    setForm((prev) => ({
      ...prev,
      [field]: value,
      [`${field}Lat`]: lat ?? null,
      [`${field}Lng`]: lng ?? null,
    }));

  // Step 2 preferences + distance fare
  const [acPref, setAcPref] = useState<boolean | null>(null);
  const [seatFilter, setSeatFilter] = useState(0);
  const [vehicle, setVehicle] = useState("");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [distLoading, setDistLoading] = useState(false);

  // Step 3 payment
  const [payProcessing, setPayProcessing] = useState(false);
  const [payMode, setPayMode] = useState<"full" | "partial" | null>(null);
  const [verifying, setVerifying] = useState(false);
  // Temporarily hides our modal while Razorpay checkout is active (removes focus trap)
  const [rzpActive, setRzpActive] = useState(false);

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
    setVerifying(false);
    setConfirmed(false);
    setRzpActive(false);
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
      config?.id,
    );
  }, [allVehicles, config, acPref, seatFilter]);

  // Pre-select vehicle by category when landing on step 2
  useEffect(() => {
    if (step === 2 && initialData?.preselectedCategory) {
      const match = filteredVehicles.find(
        (v) => v.category === initialData.preselectedCategory,
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

      let pLat = form.pickupLat,
        pLng = form.pickupLng;
      let dLat = form.destinationLat,
        dLng = form.destinationLng;

      // Geocode if coords are missing
      if (!pLat || !pLng) {
        const r = await forwardGeocode(form.pickup);
        if (r[0]) {
          pLat = r[0].lat;
          pLng = r[0].lng;
        }
      }
      if (!dLat || !dLng) {
        const r = await forwardGeocode(form.destination);
        if (r[0]) {
          dLat = r[0].lat;
          dLng = r[0].lng;
        }
      }

      if (cancelled || !pLat || !pLng || !dLat || !dLng) {
        setDistLoading(false);
        return;
      }

      const d = await getRouteDistance(pLat, pLng, dLat, dLng);
      if (!cancelled) {
        setDistanceKm(d);
        setDistLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, form.pickup, form.destination]);

  // Load Razorpay checkout.js once on mount
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(s);
    return () => {
      try {
        document.body.removeChild(s);
      } catch {
        /* already removed */
      }
    };
  }, []);

  // Minimum seats required based on passenger count entered in Step 1
  const minPassengerSeats = parseMinSeats(form.passengers);

  const selectedV = filteredVehicles.find((v) => v.type === vehicle);

  function handleClose() {
    setForm(BLANK_FORM);
    setStep(1);
    setError("");
    setAcPref(null);
    setSeatFilter(0);
    setVehicle("");
    setDistanceKm(null);
    setPayProcessing(false);
    setPayMode(null);
    setVerifying(false);
    setConfirmed(false);
    setRzpActive(false);
    onClose();
  }

  function handleStep1Next() {
    console.log(form);
    const err = validateStep1(form, config?.formType);
    console.log(err);
    if (err) {
      setError(err);
      return;
    }
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
    setTimeout(() => {
      handleClose();
      onBooked();
    }, 2000);
  }

  // Computed fare: per-km × road distance, or static for flat/hire fares
  // Round trip doubles the fare (outbound + return leg)
  const computedFare = useMemo(() => {
    if (!selectedV) return 0;
    const baseFare = getVehicleFare(selectedV, config?.id);
    const singleFare = baseFare.unit === "per km" && distanceKm != null
      ? Math.ceil(distanceKm * baseFare.amount)
      : baseFare.amount;
    return form.tripTab === "roundtrip" ? singleFare * 2 : singleFare;
  }, [selectedV, distanceKm, config, form.tripTab]);

  // Advance amount: for round trip = outbound full (halfFare) + return advance (calcAdvance(halfFare))
  const advanceAmount = useMemo(() => {
    if (form.tripTab === "roundtrip" && computedFare > 0) {
      const half = computedFare / 2;
      return half + calcAdvance(half);
    }
    return calcAdvance(computedFare);
  }, [form.tripTab, computedFare]);

  async function handleRazorpayPay(mode: "full" | "partial") {
    if (!selectedV || computedFare === 0) return;

    // Amount charged now:
    //   full    → computedFare (covers entire trip)
    //   partial → advanceAmount (covers outbound in full + return advance for round trips)
    const amount = mode === "full" ? computedFare : advanceAmount;

    setPayMode(mode);
    setPayProcessing(true);
    setError("");

    // 1. Create booking
    let bookingId: string;
    try {
      const result = await createBooking({
        serviceId: config?.id ?? "city-taxi",
        serviceTab: config?.serviceTab ?? "local",
        tripTab: form.tripTab,
        pickup: form.pickup || "Current Location",
        pickupLat: form.pickupLat ?? undefined,
        pickupLng: form.pickupLng ?? undefined,
        dropoff: form.destination || "Destination",
        dropLat: form.destinationLat ?? undefined,
        dropLng: form.destinationLng ?? undefined,
        date: form.date,
        time: form.time,
        returnDate: form.tripTab === "roundtrip" ? form.returnDate : undefined,
        returnTime: form.tripTab === "roundtrip" ? form.returnTime : undefined,
        vehicleType: vehicle,
        ac: selectedV.ac,
        seats: selectedV.seats,
        payment: "razorpay",
        customerName: session?.user?.name ?? "Guest",
        customerPhone: session?.user?.phoneNumber ?? "",
        totalFare: String(computedFare),
      });
      bookingId = result.bookingId;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create booking. Please try again.",
      );
      setPayProcessing(false);
      setPayMode(null);
      return;
    }

    // 2. Create Razorpay order
    let orderData: {
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
    };

    try {
      const orderRes = await createPaymentOrder(bookingId, amount, mode);
      orderData = orderRes.data;
    } catch {
      // Order creation failed — cancel the orphaned booking and close
      cancelBooking(bookingId)
        .then(() => qc.invalidateQueries({ queryKey: ["my-transactions"] }))
        .catch(() => {});
      handleClose();
      return;
    }

    // 3. Open Razorpay checkout
    // Close our modal first to remove its focus trap — Razorpay's iframe needs free focus
    setRzpActive(true);
    setPayProcessing(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay({
      key: orderData.keyId,
      order_id: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Mohan Cabs",
      description: mode === "full" ? "Full Payment" : "Advance Payment",
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        // Show verifying loader while we confirm with backend
        setRzpActive(false);
        setVerifying(true);
        try {
          await verifyPayment(
            bookingId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          );
          setVerifying(false);
          setConfirmed(true);
          setTimeout(() => {
            handleClose();
            onBooked();
          }, 2800);
        } catch {
          setVerifying(false);
          setError("Payment verification failed. Please contact support.");
        }
      },
      modal: {
        ondismiss: () => {
          // Cancel the booking and close
          cancelBooking(bookingId)
            .then(() => qc.invalidateQueries({ queryKey: ["my-transactions"] }))
            .catch(() => {});
          setRzpActive(false);
          setPayProcessing(false);
          setPayMode(null);
          handleClose();
        },
      },
      prefill: {
        name: session?.user?.name ?? "",
        contact: session?.user?.phoneNumber ?? "",
      },
    });
    rzp.open();
  }

  if (!isOpen && !confirmed && !verifying) return null;

  const stepLabel = isInquiry
    ? "Send Enquiry"
    : step === 1
      ? "Your Details"
      : step === 2
        ? "Choose Vehicle"
        : "Confirm Booking";

  return (
    <Modal
      isOpen={(isOpen || confirmed || verifying) && !rzpActive}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Backdrop isDismissable={false}>
        <Modal.Container>
          <Modal.Dialog>
            <div className="w-full max-w-lg max-h-[90vh] flex flex-col">
              {/* ── Verifying payment loader ───────────────────────────── */}
              {verifying ? (
                <div className="flex flex-col items-center justify-center py-14 px-8 gap-5 text-center">
                  <div className="relative w-20 h-20">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconLoader size={32} className="text-primary animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary">Confirming Payment…</p>
                    <p className="text-sm text-muted mt-1">Please wait, do not close this window</p>
                  </div>
                </div>
              ) : confirmed ? (
                /* ── Confirmation ────────────────────────────────────────── */
                <div className="flex flex-col items-center py-10 px-6 gap-5 text-center">
                  {/* Animated success icon */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
                        <IconCheckCircle size={34} className="text-success" />
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-success/30 animate-ping" />
                  </div>

                  <div>
                    <p className="text-2xl font-black text-primary">
                      {isInquiry ? "Enquiry Sent!" : "Ride Booked!"}
                    </p>
                    <p className="text-sm text-muted mt-1">
                      {isInquiry
                        ? "We'll get back to you shortly."
                        : "We're finding you the perfect driver"}
                    </p>
                  </div>

                  {/* Route card */}
                  {!isInquiry && (form.pickup || form.destination) && (
                    <div className="w-full bg-[var(--color-surface-secondary)] rounded-2xl p-4 text-left space-y-2">
                      {form.pickup && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted font-semibold uppercase tracking-wide">Pickup</p>
                            <p className="text-sm font-semibold text-primary leading-snug">{form.pickup}</p>
                          </div>
                        </div>
                      )}
                      {form.pickup && form.destination && (
                        <div className="ml-1 border-l-2 border-dashed border-border h-3" />
                      )}
                      {form.destination && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-2.5 h-2.5 rounded bg-primary shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted font-semibold uppercase tracking-wide">Drop</p>
                            <p className="text-sm font-semibold text-primary leading-snug">{form.destination}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date + Vehicle pill row */}
                  {!isInquiry && (form.date || vehicle) && (
                    <div className="flex gap-2 flex-wrap justify-center">
                      {form.date && (
                        <span className="flex items-center gap-1.5 bg-[var(--color-primary-light)] text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                          <IconCalendar size={12} />
                          {form.date}{form.time ? ` · ${form.time}` : ""}
                        </span>
                      )}
                      {vehicle && (
                        <span className="flex items-center gap-1.5 bg-[var(--color-surface-secondary)] text-muted text-xs font-semibold px-3 py-1.5 rounded-full border border-border">
                          <IconCar size={12} />
                          {vehicle}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Modal.Header className="flex items-center justify-between flex-row">
                    <div className="flex items-center gap-2">
                      {step > 1 && (
                        <button
                          onClick={() => {
                            setStep((s) => (s - 1) as 1 | 2 | 3);
                            setError("");
                          }}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] mr-1"
                        >
                          <IconChevronLeft size={16} />
                        </button>
                      )}
                      <div>
                        <p>{stepLabel}</p>
                        {config && (
                          <p className="text-[11px] font-semibold text-primary mt-0.5">
                            {config.label}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mr-12">
                      {!isInquiry && (
                        <div className="flex gap-1.5">
                          {[1, 2, 3].map((s) => (
                            <div
                              key={s}
                              className={`h-1.5 rounded-full transition-all ${
                                s === step
                                  ? "w-5 bg-primary"
                                  : s < step
                                    ? "w-1.5 bg-primary opacity-40"
                                    : "w-1.5 bg-[var(--color-border-strong)]"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <Modal.CloseTrigger />
                    </div>
                  </Modal.Header>
                  <Modal.Body className="overflow-y-auto px-1">
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

                    {step === 2 && (
                      <>
                        <div className="text-foreground mb-2">
                          <p className="text-sm mb-1">AC Preference</p>
                          <div className="flex gap-2">
                            {[
                              {
                                label: "AC",
                                val: true as boolean | null,
                                icon: true,
                              },
                              {
                                label: "Non-AC",
                                val: false as boolean | null,
                                icon: false,
                              },
                              {
                                label: "Any",
                                val: null as boolean | null,
                                icon: false,
                              },
                            ].map(({ label, val, icon }) => (
                              <button
                                key={label}
                                onClick={() => {
                                  setAcPref(val);
                                  setVehicle("");
                                }}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                  acPref === val
                                    ? "bg-primary text-white border-primary"
                                    : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-primary"
                                }`}
                              >
                                {icon && <IconWind size={14} />}
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Seat filter */}
                        <div className="mb-2">
                          <p className="text-sm text-foreground mb-1">
                            Minimum Seats
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {SEAT_OPTIONS.map(({ label, value }) => {
                              const tooFew =
                                value > 0 &&
                                minPassengerSeats > 0 &&
                                value < minPassengerSeats;
                              return (
                                <button
                                  key={label}
                                  disabled={tooFew}
                                  onClick={() => {
                                    if (!tooFew) {
                                      setSeatFilter(value);
                                      setVehicle("");
                                    }
                                  }}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                                    tooFew
                                      ? "opacity-35 cursor-not-allowed border-border"
                                      : seatFilter === value
                                        ? "bg-primary text-white"
                                        : " border-border hover:border-primary"
                                  }`}
                                >
                                  {value > 0 && <IconUsers size={14} />}
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Vehicle list */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm text-foreground">
                              Available Vehicles
                            </p>
                            {distLoading && (
                              <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                                <IconLoader
                                  size={10}
                                  className="animate-spin"
                                />
                                Calculating fare…
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
                              <br />
                              Try changing AC preference or seat count.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[38vh] overflow-y-auto scrollbar-hide">
                              {filteredVehicles.map((v) => (
                                <VehicleCard
                                  key={v.type}
                                  vehicle={v}
                                  selected={vehicle === v.type}
                                  onSelect={() => setVehicle(v.type)}
                                  serviceId={config?.id}
                                  disabled={
                                    minPassengerSeats > 0 &&
                                    v.seats < minPassengerSeats
                                  }
                                  distanceKm={distanceKm}
                                  isRoundTrip={form.tripTab === "roundtrip"}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {step === 3 && selectedV && (
                      <>
                        <RouteSummary form={form} config={config} />

                        {/* Vehicle summary */}
                        <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border my-2">
                          <IconCar size={20} className="text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-primary">
                              {selectedV.type}
                            </p>
                            <p className="text-xs text-muted">
                              {selectedV.seats} seats ·{" "}
                              {selectedV.ac ? "AC" : "Non-AC"} ·{" "}
                              {selectedV.desc}
                              {distanceKm != null && ` · ${distanceKm} km`}
                            </p>
                          </div>
                          <p className="text-[15px] font-semibold text-[var(--color-primary)]">
                            ₹{computedFare}
                          </p>
                        </div>

                        {/* Fare breakdown */}
                        <div className="rounded-xl overflow-hidden border border-border">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <span className="text-sm">Total Fare</span>
                            <span className="text-[16px] font-semibold text-primary">
                              ₹{computedFare}
                            </span>
                          </div>
                          <div className="flex items-center justify-between px-4 py-2">
                            <div>
                              <span className="text-sm ">
                                Advance (Partial Pay)
                              </span>
                              <p className="text-xs">
                                Balance ₹{computedFare - advanceAmount} paid to{" "}
                                {form.tripTab === "roundtrip" ? "return driver" : "driver"} on arrival
                              </p>
                            </div>
                            <span className=" font-semibold text-primary">
                              ₹{advanceAmount}
                            </span>
                          </div>
                        </div>

                        {error && (
                          <p className="text-[12px] text-red-500 font-medium">
                            {error}
                          </p>
                        )}
                      </>
                    )}
                  </Modal.Body>
                  <Modal.Footer className="mt-2">
                    {step === 1 && (
                      <Button onPress={handleStep1Next} fullWidth>
                        {isInquiry ? "Send Enquiry" : "See Available Cabs →"}
                      </Button>
                    )}

                    {step === 2 && (
                      <Button
                        onPress={() => setStep(3)}
                        isDisabled={!vehicle}
                        fullWidth
                      >
                        Continue →
                      </Button>
                    )}

                    {step === 3 && (
                      <div className="flex gap-2">
                        <Button
                          onPress={() => handleRazorpayPay("partial")}
                          isDisabled={payProcessing}
                          variant="secondary"
                          isLoading={payProcessing && payMode === "partial"}
                        >
                          Pay ₹{computedFare > 0 ? advanceAmount : "..."} Advance
                        </Button>

                        <Button
                          onPress={() => handleRazorpayPay("full")}
                          isDisabled={payProcessing}
                          isLoading={payProcessing && payMode === "full"}
                        >
                          Pay ₹{computedFare > 0 ? computedFare : "…"} Now
                        </Button>
                      </div>
                    )}
                  </Modal.Footer>
                </>
              )}
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

// ── Step 1: Form type renderer ────────────────────────────────────────────────

type UpdateLocationFn = (
  field: "pickup" | "destination",
  value: string,
  lat?: number | null,
  lng?: number | null,
) => void;

interface Step1Props {
  formType: string;
  serviceId?: string;
  form: FormState;
  update: (field: keyof FormState, value: string) => void;
  updateLocation: UpdateLocationFn;
  error: string;
}

function Step1Form({
  formType,
  serviceId,
  form,
  update,
  updateLocation,
  error,
}: Step1Props) {
  switch (formType) {
    case "outstation":
      return (
        <OutstationForm
          form={form}
          update={update}
          updateLocation={updateLocation}
          error={error}
        />
      );
    case "airport":
      return (
        <AirportForm
          form={form}
          update={update}
          updateLocation={updateLocation}
          error={error}
        />
      );
    case "railway":
      return (
        <RailwayForm
          form={form}
          update={update}
          updateLocation={updateLocation}
          error={error}
        />
      );
    case "hire":
      return (
        <HireForm
          form={form}
          update={update}
          updateLocation={updateLocation}
          error={error}
          serviceId={serviceId}
        />
      );
    case "event":
      return (
        <EventForm
          form={form}
          update={update}
          updateLocation={updateLocation}
          error={error}
        />
      );
    case "group":
      return (
        <GroupForm
          form={form}
          update={update}
          updateLocation={updateLocation}
          error={error}
        />
      );
    case "inquiry":
      return (
        <InquiryForm
          form={form}
          update={update}
          updateLocation={updateLocation}
          error={error}
        />
      );
    default:
      return (
        <StandardForm
          form={form}
          update={update}
          updateLocation={updateLocation}
          error={error}
        />
      );
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
    <div className="space-y-2 pb-2">
      <TripToggle value={form.tripTab} onChange={(v) => update("tripTab", v)} />
      <LocationInput
        label="Pickup Location"
        dotClass="rounded-full bg-primary"
        value={form.pickup}
        onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="Enter pickup location"
        highlight={!!error && !form.pickup.trim()}
      />
      <DateTimeRow
        date={form.date}
        time={form.time}
        onDate={(v) => update("date", v)}
        onTime={(v) => update("time", v)}
      />
      <LocationInput
        label="Destination"
        dotClass="rounded bg-primary"
        value={form.destination}
        onChange={(v, lat, lng) => updateLocation("destination", v, lat, lng)}
        placeholder="Enter destination"
        highlight={!!error && !form.destination.trim()}
      />
      {form.tripTab === "roundtrip" && (
        <DateTimeRow
          label="Return Date and Time"
          date={form.returnDate}
          time={form.returnTime}
          onDate={(v) => update("returnDate", v)}
          onTime={(v) => update("returnTime", v)}
        />
      )}
      {error.length > 0 && <p className="text-danger">{error}</p>}
    </div>
  );
}

// Outstation: from city → to city
function OutstationForm({ form, update, updateLocation, error }: FormProps) {
  return (
    <>
      <TripToggle value={form.tripTab} onChange={(v) => update("tripTab", v)} />
      <LocationInput
        label="Departure City"
        dotClass="rounded-full bg-primary"
        value={form.pickup}
        onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="E.g. Trivandrum"
        highlight={!!error && !form.pickup.trim()}
      />
      <LocationInput
        label="Destination City"
        dotClass="rounded bg-primary"
        value={form.destination}
        onChange={(v, lat, lng) => updateLocation("destination", v, lat, lng)}
        placeholder="E.g. Kochi, Bangalore…"
        highlight={!!error && !form.destination.trim()}
      />
      <DateTimeRow
        label="Journey Date & Time"
        date={form.date}
        time={form.time}
        onDate={(v) => update("date", v)}
        onTime={(v) => update("time", v)}
      />
      {form.tripTab === "roundtrip" && (
        <DateTimeRow
          label="Return Date & Time"
          date={form.returnDate}
          time={form.returnTime}
          onDate={(v) => update("returnDate", v)}
          onTime={(v) => update("returnTime", v)}
        />
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
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">
          Direction
        </p>
        <div className="flex gap-2">
          {[
            { val: "to", label: "To Airport", icon: <IconPlane size={13} /> },
            {
              val: "from",
              label: "From Airport",
              icon: <IconArrowLeftRight size={13} />,
            },
          ].map(({ val, label, icon }) => (
            <button
              key={val}
              onClick={() => update("direction", val)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                form.direction === val
                  ? "bg-primary text-white border-primary"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-primary"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>
      <LocationInput
        label={
          form.direction === "to" ? "Your Pickup Address" : "Airport Terminal"
        }
        dotClass="rounded-full bg-primary"
        value={form.pickup}
        onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder={
          form.direction === "to" ? "Home / Office address" : "E.g. Terminal 1"
        }
        highlight={!!error && !form.pickup.trim()}
      />
      <DateTimeRow
        label="Flight Date & Time"
        date={form.date}
        time={form.time}
        onDate={(v) => update("date", v)}
        onTime={(v) => update("time", v)}
      />
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">
          Flight Number{" "}
          <span className="normal-case font-medium">(optional)</span>
        </p>
        <FieldInput
          value={form.refNumber}
          onChange={(v) => update("refNumber", v)}
          placeholder="E.g. 6E 204"
        />
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
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">
          Direction
        </p>
        <div className="flex gap-2">
          {[
            { val: "to", label: "To Station" },
            { val: "from", label: "From Station" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => update("direction", val)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                form.direction === val
                  ? "bg-primary text-white border-primary"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <LocationInput
        label={form.direction === "to" ? "Your Pickup Address" : "Station Name"}
        dotClass="rounded-full bg-primary"
        value={form.pickup}
        onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder={
          form.direction === "to"
            ? "Home / Office address"
            : "E.g. Trivandrum Central"
        }
        highlight={!!error && !form.pickup.trim()}
      />
      <DateTimeRow
        label="Train Date & Time"
        date={form.date}
        time={form.time}
        onDate={(v) => update("date", v)}
        onTime={(v) => update("time", v)}
      />
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">
          Train Number{" "}
          <span className="normal-case font-medium">(optional)</span>
        </p>
        <FieldInput
          value={form.refNumber}
          onChange={(v) => update("refNumber", v)}
          placeholder="E.g. 12625"
        />
      </div>
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Hire: Full Day, Weekly Commute, Rent a Car
function HireForm({
  form,
  update,
  updateLocation,
  error,
  serviceId,
}: FormProps & { serviceId?: string }) {
  const isWeekly = serviceId === "weekly-commute";
  const isRentCar = serviceId === "rent-a-car";

  return (
    <>
      <LocationInput
        label="Pickup Location"
        dotClass="rounded-full bg-primary"
        value={form.pickup}
        onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="Your pickup address"
        highlight={!!error && !form.pickup.trim()}
      />
      <DateTimeRow
        label="Start Date & Time"
        date={form.date}
        time={form.time}
        onDate={(v) => update("date", v)}
        onTime={(v) => update("time", v)}
      />
      {isRentCar && (
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">
            Return Date
          </p>
          <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 py-2.5 focus-within:border-primary">
            <IconCalendar
              size={14}
              className="text-[var(--color-text-tertiary)]"
            />
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="flex-1 text-[13px] text-[var(--color-text-secondary)] outline-none bg-transparent"
            />
          </div>
        </div>
      )}
      {!isRentCar && (
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">
            Duration
          </p>
          <div className="flex gap-2 flex-wrap">
            {(isWeekly
              ? ["5 Days", "7 Days"]
              : ["4 Hours", "8 Hours", "12 Hours"]
            ).map((opt) => (
              <button
                key={opt}
                onClick={() => update("duration", opt)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                  form.duration === opt
                    ? "bg-primary text-white border-primary"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-primary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      {isWeekly && (
        <LocationInput
          label="Daily Destination (Office / Workplace)"
          dotClass="rounded bg-primary"
          value={form.destination}
          onChange={(v, lat, lng) => updateLocation("destination", v, lat, lng)}
          placeholder="Daily drop location"
          highlight={false}
        />
      )}
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Event: Wedding, Tours, Events
function EventForm({ form, update, updateLocation, error }: FormProps) {
  return (
    <>
      <DateTimeRow
        label="Event / Tour Date"
        date={form.date}
        time={form.time}
        onDate={(v) => update("date", v)}
        onTime={(v) => update("time", v)}
      />
      <LocationInput
        label="Pickup / Venue"
        dotClass="rounded-full bg-primary"
        value={form.pickup}
        onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="Venue or pickup address"
        highlight={!!error && !form.pickup.trim()}
      />
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">
          Duration
        </p>
        <div className="flex gap-2 flex-wrap">
          {["Half Day (4 hrs)", "Full Day (8 hrs)", "Multi-Day"].map((opt) => (
            <button
              key={opt}
              onClick={() => update("duration", opt)}
              className={`px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                form.duration === opt
                  ? "bg-primary text-white border-primary"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-primary"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">
          Passengers
        </p>
        <PassengerSelect
          value={form.passengers}
          onChange={(v) => update("passengers", v)}
          options={["1-3", "4-6", "7-10", "10-15", "15+"]}
        />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">
          Special Requests{" "}
          <span className="normal-case font-medium">(optional)</span>
        </p>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
          placeholder="Decoration, multiple vehicles, accessibility needs…"
          className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[13px] text-primary bg-transparent outline-none resize-none focus:border-primary"
        />
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
      <LocationInput
        label="Pickup Location"
        dotClass="rounded-full bg-primary"
        value={form.pickup}
        onChange={(v, lat, lng) => updateLocation("pickup", v, lat, lng)}
        placeholder="Enter pickup location"
        highlight={!!error && !form.pickup.trim()}
      />
      <LocationInput
        label="Destination"
        dotClass="rounded bg-primary"
        value={form.destination}
        onChange={(v, lat, lng) => updateLocation("destination", v, lat, lng)}
        placeholder="Enter destination"
        highlight={!!error && !form.destination.trim()}
      />
      <DateTimeRow
        date={form.date}
        time={form.time}
        onDate={(v) => update("date", v)}
        onTime={(v) => update("time", v)}
      />
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">
          <span className="flex items-center gap-1">
            <IconUsers size={11} /> Passengers
          </span>
        </p>
        <PassengerSelect
          value={form.passengers}
          onChange={(v) => update("passengers", v)}
          options={["8", "9", "10", "12", "14", "16", "20"]}
        />
      </div>
      {form.tripTab === "roundtrip" && (
        <DateTimeRow
          date={form.returnDate}
          time={form.returnTime}
          onDate={(v) => update("returnDate", v)}
          onTime={(v) => update("returnTime", v)}
        />
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
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">
            Your Name
          </p>
          <FieldInput
            value={form.inqName}
            onChange={(v) => update("inqName", v)}
            placeholder="Full name"
            highlight={!!error && !form.inqName.trim()}
          />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">
            Phone Number
          </p>
          <FieldInput
            value={form.inqPhone}
            onChange={(v) => update("inqPhone", v)}
            placeholder="9876543210"
            highlight={!!error && !form.inqPhone.trim()}
          />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">
          Company / School Name
        </p>
        <FieldInput
          value={form.inqOrg}
          onChange={(v) => update("inqOrg", v)}
          placeholder="Organisation name"
          highlight={!!error && !form.inqOrg.trim()}
        />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">
          Requirements
        </p>
        <textarea
          value={form.inqMessage}
          onChange={(e) => update("inqMessage", e.target.value)}
          rows={4}
          placeholder="Describe your transport needs, number of employees/students, routes, schedule…"
          className={`w-full border rounded-xl px-3 py-2.5 text-[13px] text-primary bg-transparent outline-none resize-none focus:border-primary ${
            error && !form.inqMessage.trim()
              ? "border-red-400"
              : "border-[var(--color-border)]"
          }`}
        />
      </div>
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// ── Reusable field components ─────────────────────────────────────────────────

function TripToggle({
  value,
  onChange,
}: {
  value: TripTab;
  onChange: (v: TripTab) => void;
}) {
  return (
    <Tabs
      selectedKey={value}
      onSelectionChange={(key) => onChange(key as TripTab)}
      className="mt-2 "
    >
      <Tabs.ListContainer>
        <Tabs.List>
          {TRIP_TABS.map(({ id, label }) => (
            <Tabs.Tab key={id} id={id}>
              {label}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}

function LocationInput({
  label,
  dotClass,
  value,
  onChange,
  placeholder,
  highlight,
}: {
  label: string;
  dotClass: string;
  value: string;
  onChange: (v: string, lat?: number | null, lng?: number | null) => void;
  placeholder: string;
  highlight: boolean;
}) {
  const [showMap,      setShowMap]      = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions,  setSuggestions]  = useState<GeoResult[]>([]);
  const [loadingSug,   setLoadingSug]   = useState(false);
  const [locating,     setLocating]     = useState(false);
  // Fixed-position coords so dropdown escapes the Modal's overflow-y-auto container
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const inputRef    = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const openDropdown = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setShowDropdown(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val, null, null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingSug(true);
        const results = await forwardGeocode(val);
        setSuggestions(results);
      } finally {
        setLoadingSug(false);
      }
    }, 350);
  };

  const handleSelectRecent = (place: string) => {
    onChange(place, null, null);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleSelectSuggestion = (s: GeoResult) => {
    onChange(s.name, s.lat, s.lng);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const addr = await reverseGeocode(coords.latitude, coords.longitude);
          onChange(addr, coords.latitude, coords.longitude);
        } finally { setLocating(false); }
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  const showingRecent      = !value.trim() && recentPlaces.length > 0;
  const showingSuggestions = !!value.trim() && (suggestions.length > 0 || loadingSug);
  const dropdownVisible    = showDropdown && (showingRecent || showingSuggestions);

  return (
    <div>
      <Label className="block mb-1">{label}</Label>
      <div className={`relative ${highlight ? "ring-1 ring-danger rounded-xl" : ""}`}>
        <div className="relative">
          {/* Dot indicator */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <div className={`w-2.5 h-2.5 ${dotClass}`} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={openDropdown}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder={placeholder}
            className="w-full pl-8 pr-16 px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {/* Current location */}
          <button
            type="button"
            onClick={handleLocate}
            disabled={locating}
            title="Use current location"
            className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted hover:text-primary disabled:opacity-50"
          >
            {locating
              ? <IconLoader size={14} className="animate-spin" />
              : <IconLocate size={14} />}
          </button>

          {/* Map pin */}
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            title="Pin on map"
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
              showMap ? "text-primary" : "text-muted hover:text-primary"
            }`}
          >
            <IconMapPin size={15} />
          </button>

          {/* Dropdown — fixed position so it escapes Modal's overflow-y-auto */}
          {dropdownVisible && dropdownRect && (
            <div
              style={{ position: "fixed", top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width, zIndex: 9999 }}
              className="bg-background border border-border rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto"
            >
              {showingRecent && (
                <>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-widest text-muted uppercase">Recent</p>
                  {recentPlaces.map((place) => (
                    <button
                      key={place}
                      type="button"
                      onMouseDown={() => handleSelectRecent(place)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-border/30 transition-colors"
                    >
                      <IconClock size={13} className="shrink-0 text-muted" />
                      <span className="truncate">{place}</span>
                    </button>
                  ))}
                </>
              )}
              {showingSuggestions && (
                <>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-widest text-muted uppercase">Suggestions</p>
                  {loadingSug ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted">
                      <IconLoader size={13} className="animate-spin shrink-0" />
                      Searching…
                    </div>
                  ) : (
                    suggestions.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onMouseDown={() => handleSelectSuggestion(s)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-border/30 transition-colors"
                      >
                        <IconMapPin size={13} className="shrink-0 text-primary" />
                        <span className="truncate">{s.name}</span>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden mt-1"
          >
            <LocationPickerMap
              initialAddress={value}
              onConfirm={(addr, coords) => {
                onChange(addr, coords?.lat, coords?.lng);
                setShowMap(false);
              }}
              onCancel={() => setShowMap(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DateTimeRow({
  label,
  date,
  time,
  onDate,
  onTime,
}: {
  label?: string;
  date: string;
  time: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
}) {
  return (
    <div>
      <Label className="block mb-1">{label ? label : "Date and Time"}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          variant="secondary"
          value={date}
          onChange={(e) => onDate(e.target.value)}
        />
        <Input
          type="time"
          variant="secondary"
          value={time}
          onChange={(e) => onTime(e.target.value)}
        />
      </div>
    </div>
  );
}

function FieldInput({
  value,
  onChange,
  placeholder,
  highlight,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center border rounded-xl px-3 py-2.5 focus-within:border-primary ${
        highlight ? "border-red-400" : "border-[var(--color-border)]"
      }`}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-[14px] outline-none text-primary bg-transparent"
      />
    </div>
  );
}

function PassengerSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
            value === opt
              ? "bg-primary text-white border-primary"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-primary"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function RouteSummary({
  form,
  config,
}: {
  form: FormState;
  config?: { label: string };
}) {
  const entries = [
    ...(config
      ? [
          {
            label: "Service",
            value: config.label,
          },
        ]
      : []),

    {
      label: "Pickup Location",
      value: form.pickup,
    },
    {
      label: "Destination",
      value: form.destination,
    },
    {
      label: "Pickup Date",
      value: form.date,
    },
    {
      label: "Pickup Time",
      value: form.time,
    },
    {
      label: "Trip Type",
      value: form.tripTab,
    },
    {
      label: "Return Date",
      value: form.returnDate,
    },
    {
      label: "Return Time",
      value: form.returnTime,
    },
  ];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
      <div className="space-y-3">
        {entries.map(({ label, value }) => (
          <div key={label} className="grid grid-cols-[140px_1fr] gap-3 text-sm">
            <span className="text-[var(--color-text-tertiary)] font-medium">
              {label}
            </span>

            <span className="text-primary break-words capitalize">
              {value?.toString().trim() || "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  selected,
  onSelect,
  serviceId,
  disabled,
  distanceKm,
  isRoundTrip,
}: {
  vehicle: Vehicle;
  selected: boolean;
  onSelect: () => void;
  serviceId?: string;
  disabled?: boolean;
  distanceKm?: number | null;
  isRoundTrip?: boolean;
}) {
  const fare = getVehicleFare(vehicle, serviceId);
  const singleAmount =
    fare.unit === "per km" && distanceKm != null
      ? Math.ceil(distanceKm * fare.amount)
      : null;
  const computedAmount = singleAmount != null
    ? (isRoundTrip ? singleAmount * 2 : singleAmount)
    : null;

  return (
    <button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left ${
        disabled
          ? "bg-[var(--color-surface-muted)] border-[var(--color-border)] opacity-50 cursor-not-allowed"
          : selected
            ? "bg-[var(--color-primary-light)] border-primary"
            : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-primary"
      }`}
    >
      <IconCar
        size={20}
        className={
          disabled
            ? "text-[var(--color-text-tertiary)]"
            : selected
              ? "text-primary"
              : "text-muted"
        }
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary truncate">
          {vehicle.type}
        </p>
        <p className="text-xs text-muted">
          {vehicle.seats} seats · {vehicle.ac ? "AC" : "Non-AC"} · ETA{" "}
          {vehicle.eta}
          {disabled && (
            <span className="ml-1.5 font-semibold text-red-400">
              · Insufficient seats
            </span>
          )}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-base font-semibold ${disabled ? "text-muted" : "text-primary"}`}
        >
          {computedAmount != null ? `₹${computedAmount}` : formatFare(fare)}
        </p>
        {computedAmount != null && (
          <p className="text-xs text-muted">{formatFare(fare)}</p>
        )}
      </div>
      {selected && !disabled && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
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

/** Parse a passenger string like "8", "7-10", "15+" into a minimum seat count. */
function parseMinSeats(passengers: string): number {
  if (!passengers) return 0;
  if (passengers.endsWith("+")) return parseInt(passengers) || 0;
  // "7-10" or "7-10" → lower bound
  const parts = passengers.split(/[-\-]/);
  return parseInt(parts[0]) || 0;
}

function seedForm(initialData?: BookingInitialData): FormState {
  const config = initialData?.serviceId
    ? getServiceConfig(initialData.serviceId)
    : undefined;
  return {
    ...BLANK_FORM,
    pickup: initialData?.pickup ?? "",
    pickupLat: initialData?.pickupLat ?? null,
    pickupLng: initialData?.pickupLng ?? null,
    destination: initialData?.destination ?? "",
    destinationLat: initialData?.destinationLat ?? null,
    destinationLng: initialData?.destinationLng ?? null,
    date: initialData?.date ?? "",
    time: initialData?.time ?? "",
    returnDate: initialData?.returnDate ?? "",
    tripTab: initialData?.tripTab ?? config?.defaultTripTab ?? "oneway",
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
      if (!form.pickup.trim())
        return "Please enter the venue or pickup address.";
      if (!form.date) return "Please select a date.";
      if (!form.time) return "Please select a time.";
      return "";
    case "group":
      if (!form.pickup.trim() || !form.destination.trim())
        return "Please enter pickup and destination.";
      if (!form.passengers) return "Please select the number of passengers.";
      if (!form.date) return "Please select a date.";
      if (!form.time) return "Please select a time.";
      return "";
    case "inquiry":
      if (!form.inqName.trim() || !form.inqPhone.trim())
        return "Please enter your name and phone number.";
      if (!form.inqOrg.trim()) return "Please enter your organisation name.";
      if (!form.inqMessage.trim()) return "Please describe your requirements.";
      return "";
    default:
      if (!form.pickup.trim() || !form.destination.trim())
        return "Please enter pickup and destination.";
      if (!form.date) return "Please select a pickup date.";
      if (!form.time) return "Please select a pickup time.";
      if (form.tripTab === "roundtrip" && !form.returnDate)
        return "Please select a return date.";
      if (form.tripTab === "roundtrip" && !form.returnTime)
        return "Please select a return time.";
      if (form.tripTab === "roundtrip") {
        const pickupDateTime = new Date(`${form.date}T${form.time}`);
        const returnDateTime = new Date(
          `${form.returnDate}T${form.returnTime}`,
        );
        if (returnDateTime <= pickupDateTime) {
          return "Return date and time must be later than the pickup date and time.";
        }
      }
      return "";
  }
}

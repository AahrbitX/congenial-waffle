"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { useVehicles, useCreateBooking } from "@/hooks/useBooking";
import { PAYMENT_OPTIONS, filterVehicles, getVehicleFare, formatFare } from "@/data/booking.mock";
import { getServiceConfig } from "@/data/serviceConfig";
import type { PaymentOption } from "@/data/booking.mock";
import type { BookingInitialData, TripTab, Vehicle } from "@/types/booking.types";
import {
  IconX, IconChevronLeft, IconMapPin, IconCar, IconCheck, IconCheckCircle,
  IconCalendar, IconClock, IconWind, IconUsers, IconRoundTrip, IconPlane,
  IconArrowLeftRight,
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
  pickup:       string;
  destination:  string;
  date:         string;
  time:         string;
  tripTab:      TripTab;
  returnDate:   string;
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
  pickup: "", destination: "", date: "", time: "",
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

  const [step,      setStep]      = useState<1 | 2 | 3>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [error,     setError]     = useState("");

  // Step 1 form state
  const [form, setForm] = useState<FormState>(() => seedForm(initialData));
  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Step 2 preferences
  const [acPref,     setAcPref]     = useState<boolean | null>(null);
  const [seatFilter, setSeatFilter] = useState(0);
  const [vehicle,    setVehicle]    = useState("");

  // Step 3 payment
  const [payment, setPayment] = useState<PaymentOption>("UPI");

  // Re-seed when modal reopens with new data
  useEffect(() => {
    setForm(seedForm(initialData));
    setStep(1);
    setError("");
    setAcPref(null);
    setSeatFilter(0);
    setVehicle("");
    setPayment("UPI");
    setConfirmed(false);
  }, [initialData]);

  const { data: allVehicles = [] }  = useVehicles();
  const { mutate: book, isPending } = useCreateBooking();

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

  // Minimum seats required based on passenger count entered in Step 1
  const minPassengerSeats = parseMinSeats(form.passengers);

  const selectedV = filteredVehicles.find((v) => v.type === vehicle);

  function handleClose() {
    setForm(BLANK_FORM);
    setStep(1); setError(""); setAcPref(null);
    setSeatFilter(0); setVehicle(""); setPayment("UPI"); setConfirmed(false);
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

  function handleConfirm() {
    book(
      {
        serviceId:   config?.id ?? "city-taxi",
        serviceTab:  config?.serviceTab ?? "local",
        tripTab:     form.tripTab,
        pickup:      form.pickup      || "Current Location",
        dropoff:     form.destination || "Destination",
        date:        form.date,
        time:        form.time,
        returnDate:  form.tripTab === "roundtrip" ? form.returnDate : undefined,
        vehicleType: vehicle,
        ac:          selectedV?.ac ?? true,
        seats:       selectedV?.seats ?? 4,
        payment,
      },
      {
        onSuccess: () => {
          setConfirmed(true);
          setTimeout(() => { handleClose(); onBooked(); }, 1800);
        },
      }
    );
  }

  if (!isOpen) return null;

  const stepLabel = isInquiry
    ? "Send Enquiry"
    : step === 1 ? "Your Details"
    : step === 2 ? "Choose Vehicle"
    : "Confirm Booking";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

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
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Available Vehicles</p>
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

                  <div className="flex items-center gap-4 px-4 py-3 bg-[var(--color-primary-light)] rounded-xl border border-[var(--color-primary)]/20">
                    <IconCar size={20} className="text-[var(--color-primary)]" />
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-[var(--color-text-primary)]">{selectedV.type}</p>
                      <p className="text-[12px] text-[var(--color-text-tertiary)]">
                        {selectedV.seats} seats · {selectedV.ac ? "AC" : "Non-AC"} · {selectedV.desc}
                      </p>
                    </div>
                    <p className="text-[15px] font-black text-[var(--color-primary)]">
                      {formatFare(getVehicleFare(selectedV, config?.id))}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Payment Method</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PAYMENT_OPTIONS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setPayment(m)}
                          className={`py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                            payment === m
                              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                              : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
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
                <Button
                  onPress={handleConfirm}
                  isLoading={isPending}
                  className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 rounded-xl"
                >
                  <IconCheck size={16} className="mr-1.5" />
                  Confirm Booking{selectedV ? ` · ${formatFare(getVehicleFare(selectedV, config?.id))}` : ""}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Form type renderer ────────────────────────────────────────────────

interface Step1Props {
  formType: string;
  serviceId?: string;
  form: FormState;
  update: (field: keyof FormState, value: string) => void;
  error: string;
}

function Step1Form({ formType, serviceId, form, update, error }: Step1Props) {
  switch (formType) {
    case "outstation": return <OutstationForm form={form} update={update} error={error} />;
    case "airport":    return <AirportForm    form={form} update={update} error={error} />;
    case "railway":    return <RailwayForm    form={form} update={update} error={error} />;
    case "hire":       return <HireForm       form={form} update={update} error={error} serviceId={serviceId} />;
    case "event":      return <EventForm      form={form} update={update} error={error} />;
    case "group":      return <GroupForm      form={form} update={update} error={error} />;
    case "inquiry":    return <InquiryForm    form={form} update={update} error={error} />;
    default:           return <StandardForm   form={form} update={update} error={error} />;
  }
}

// ── Form variants ─────────────────────────────────────────────────────────────

interface FormProps {
  form: FormState;
  update: (field: keyof FormState, value: string) => void;
  error: string;
}

// Standard: City Taxi, Nationwide
function StandardForm({ form, update, error }: FormProps) {
  return (
    <>
      <TripToggle value={form.tripTab} onChange={(v) => update("tripTab", v)} />
      <LocationInput label="Pickup Location" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v) => update("pickup", v)}
        placeholder="Enter pickup location" highlight={!!error && !form.pickup.trim()} />
      <DateTimeRow date={form.date} time={form.time} onDate={(v) => update("date", v)} onTime={(v) => update("time", v)} />
      <LocationInput label="Destination" dotClass="rounded bg-[var(--color-text-primary)]"
        value={form.destination} onChange={(v) => update("destination", v)}
        placeholder="Enter destination" highlight={!!error && !form.destination.trim()} />
      {form.tripTab === "roundtrip" && (
        <ReturnDateInput value={form.returnDate} onChange={(v) => update("returnDate", v)} />
      )}
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Outstation: from city → to city
function OutstationForm({ form, update, error }: FormProps) {
  return (
    <>
      <TripToggle value={form.tripTab} onChange={(v) => update("tripTab", v)} />
      <LocationInput label="Departure City" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v) => update("pickup", v)}
        placeholder="E.g. Trivandrum" highlight={!!error && !form.pickup.trim()} />
      <LocationInput label="Destination City" dotClass="rounded bg-[var(--color-text-primary)]"
        value={form.destination} onChange={(v) => update("destination", v)}
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
function AirportForm({ form, update, error }: FormProps) {
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
        value={form.pickup} onChange={(v) => update("pickup", v)}
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
function RailwayForm({ form, update, error }: FormProps) {
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
        value={form.pickup} onChange={(v) => update("pickup", v)}
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
function HireForm({ form, update, error, serviceId }: FormProps & { serviceId?: string }) {
  const isWeekly  = serviceId === "weekly-commute";
  const isRentCar = serviceId === "rent-a-car";

  return (
    <>
      <LocationInput label="Pickup Location" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v) => update("pickup", v)}
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
          value={form.destination} onChange={(v) => update("destination", v)}
          placeholder="Daily drop location" highlight={false} />
      )}
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
    </>
  );
}

// Event: Wedding, Tours, Events
function EventForm({ form, update, error }: FormProps) {
  return (
    <>
      <DateTimeRow label="Event / Tour Date"
        date={form.date} time={form.time} onDate={(v) => update("date", v)} onTime={(v) => update("time", v)} />
      <LocationInput label="Pickup / Venue" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v) => update("pickup", v)}
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
function GroupForm({ form, update, error }: FormProps) {
  return (
    <>
      <TripToggle value={form.tripTab} onChange={(v) => update("tripTab", v)} />
      <LocationInput label="Pickup Location" dotClass="rounded-full bg-[var(--color-primary)]"
        value={form.pickup} onChange={(v) => update("pickup", v)}
        placeholder="Enter pickup location" highlight={!!error && !form.pickup.trim()} />
      <LocationInput label="Destination" dotClass="rounded bg-[var(--color-text-primary)]"
        value={form.destination} onChange={(v) => update("destination", v)}
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
function InquiryForm({ form, update, error }: FormProps) {
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
  onChange: (v: string) => void; placeholder: string; highlight: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">{label}</p>
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors ${
        highlight ? "border-red-400" : "border-[var(--color-border)] focus-within:border-[var(--color-primary)]"
      }`}>
        <div className={`w-2.5 h-2.5 shrink-0 ${dotClass}`} />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 text-[14px] outline-none text-[var(--color-text-primary)] bg-transparent" />
      </div>
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

function VehicleCard({ vehicle, selected, onSelect, serviceId, disabled }: {
  vehicle: Vehicle; selected: boolean; onSelect: () => void; serviceId?: string; disabled?: boolean;
}) {
  const fare = getVehicleFare(vehicle, serviceId);
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
        <p className={`text-[15px] font-black ${disabled ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-primary)]"}`}>{formatFare(fare)}</p>
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
    pickup:      initialData?.pickup      ?? "",
    destination: initialData?.destination ?? "",
    date:        initialData?.date        ?? "",
    time:        initialData?.time        ?? "",
    returnDate:  initialData?.returnDate  ?? "",
    tripTab:     initialData?.tripTab ?? config?.defaultTripTab ?? "oneway",
  };
}

function validateStep1(form: FormState, formType?: string): string {
  switch (formType) {
    case "airport":
    case "railway":
      if (!form.pickup.trim()) return "Please enter your address.";
      return "";
    case "hire":
      if (!form.pickup.trim()) return "Please enter a pickup location.";
      return "";
    case "event":
      if (!form.pickup.trim()) return "Please enter the venue or pickup address.";
      return "";
    case "group":
      if (!form.pickup.trim() || !form.destination.trim()) return "Please enter pickup and destination.";
      if (!form.passengers) return "Please select the number of passengers.";
      return "";
    case "inquiry":
      if (!form.inqName.trim() || !form.inqPhone.trim()) return "Please enter your name and phone number.";
      if (!form.inqOrg.trim()) return "Please enter your organisation name.";
      if (!form.inqMessage.trim()) return "Please describe your requirements.";
      return "";
    default:
      if (!form.pickup.trim() || !form.destination.trim()) return "Please enter pickup and destination.";
      return "";
  }
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { useVehicles, useCreateBooking } from "@/hooks/useBooking";
import { PAYMENT_OPTIONS, filterVehicles } from "@/data/booking.mock";
import type { PaymentOption } from "@/data/booking.mock";
import type { BookingInitialData, ServiceTab, TripTab, Vehicle } from "@/types/booking.types";
import {
  IconX, IconChevronLeft, IconMapPin, IconCar, IconCheck, IconCheckCircle,
  IconCalendar, IconClock, IconPlane, IconArrowLeftRight, IconWind, IconUsers,
  IconRoundTrip,
} from "@/constants/icons";

interface BookRideModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onBooked:     () => void;
  serviceName?: string;
  initialData?: BookingInitialData;
}

// ── Service tab config ────────────────────────────────────────────────────────

const SERVICE_TABS: { id: ServiceTab; label: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: "local",      label: "City",       Icon: (p) => <IconMapPin {...p} /> },
  { id: "outstation", label: "Outstation", Icon: (p) => <IconArrowLeftRight {...p} /> },
  { id: "airport",    label: "Airport",    Icon: (p) => <IconPlane {...p} /> },
];

const TRIP_TABS: { id: TripTab; label: string }[] = [
  { id: "oneway",    label: "One Way"    },
  { id: "roundtrip", label: "Round Trip" },
];

const SEAT_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "4",   value: 4 },
  { label: "6",   value: 6 },
  { label: "7+",  value: 7 },
  { label: "12",  value: 12 },
];

const STEP_LABELS = ["Route", "Vehicle", "Payment"];

// ── Main component ────────────────────────────────────────────────────────────

export function BookRideModal({ isOpen, onClose, onBooked, serviceName, initialData }: BookRideModalProps) {
  const [step,        setStep]        = useState<1 | 2 | 3>(1);
  const [confirmed,   setConfirmed]   = useState(false);

  // Step 1 — Route & Service
  const [serviceTab,   setServiceTab]   = useState<ServiceTab>(initialData?.serviceTab   ?? "local");
  const [tripTab,      setTripTab]      = useState<TripTab>(initialData?.tripTab         ?? "oneway");
  const [pickup,       setPickup]       = useState(initialData?.pickup                   ?? "");
  const [destination,  setDestination]  = useState(initialData?.destination              ?? "");
  const [date,         setDate]         = useState(initialData?.date                     ?? "");
  const [time,         setTime]         = useState(initialData?.time                     ?? "");
  const [returnDate,   setReturnDate]   = useState(initialData?.returnDate               ?? "");
  const [step1Error,   setStep1Error]   = useState("");

  // Step 2 — Preferences
  const [acPref,      setAcPref]      = useState<boolean | null>(null);
  const [seatFilter,  setSeatFilter]  = useState(0);
  const [vehicle,     setVehicle]     = useState("");

  // Step 3 — Payment
  const [payment, setPayment] = useState<PaymentOption>("UPI");

  // Re-seed state when modal reopens with new hero data
  useEffect(() => {
    if (initialData) {
      setServiceTab(initialData.serviceTab   ?? "local");
      setTripTab(initialData.tripTab         ?? "oneway");
      setPickup(initialData.pickup           ?? "");
      setDestination(initialData.destination ?? "");
      setDate(initialData.date               ?? "");
      setTime(initialData.time               ?? "");
      setReturnDate(initialData.returnDate   ?? "");
    }
  }, [initialData]);

  // Reset vehicle selection when service tab changes
  useEffect(() => { setVehicle(""); }, [serviceTab]);

  const { data: allVehicles = [] }     = useVehicles();
  const { mutate: book, isPending }    = useCreateBooking();

  const filteredVehicles = useMemo(
    () => filterVehicles(allVehicles, serviceTab, acPref, seatFilter),
    [allVehicles, serviceTab, acPref, seatFilter]
  );

  const selectedV = filteredVehicles.find((v) => v.type === vehicle);

  function reset() {
    setStep(1);
    setConfirmed(false);
    setServiceTab(initialData?.serviceTab   ?? "local");
    setTripTab(initialData?.tripTab         ?? "oneway");
    setPickup(initialData?.pickup           ?? "");
    setDestination(initialData?.destination ?? "");
    setDate(initialData?.date               ?? "");
    setTime(initialData?.time               ?? "");
    setReturnDate(initialData?.returnDate   ?? "");
    setStep1Error("");
    setAcPref(null);
    setSeatFilter(0);
    setVehicle("");
    setPayment("UPI");
  }

  function handleClose() { reset(); onClose(); }

  function handleStep1Next() {
    if (!pickup.trim() || !destination.trim()) {
      setStep1Error("Please enter both pickup and destination.");
      return;
    }
    setStep1Error("");
    setStep(2);
  }

  function handleConfirm() {
    book(
      {
        serviceTab,
        tripTab,
        pickup:      pickup      || "Current Location",
        dropoff:     destination || "Technopark Phase 3",
        date,
        time,
        returnDate:  tripTab === "roundtrip" ? returnDate : undefined,
        vehicleType: vehicle,
        ac:          selectedV?.ac ?? true,
        seats:       selectedV?.seats ?? 4,
        payment,
      },
      {
        onSuccess: () => {
          setConfirmed(true);
          setTimeout(() => { reset(); onBooked(); onClose(); }, 1800);
        },
      }
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Confirmation screen ─────────────────────────────────── */}
        {confirmed ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-success-light)] flex items-center justify-center">
              <IconCheckCircle size={32} className="text-[var(--color-success)]" />
            </div>
            <p className="text-[20px] font-black text-[var(--color-text-primary)]">Ride Booked!</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)]">Looking for a driver nearby…</p>
            <div className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[13px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5">
              <IconMapPin size={13} /> {pickup || "Your pickup"}
            </div>
          </div>
        ) : (
          <>
            {/* ── Fixed header ──────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button
                    onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] mr-1"
                  >
                    <IconChevronLeft size={16} />
                  </button>
                )}
                <div>
                  <p className="text-[16px] font-black text-[var(--color-text-primary)]">
                    {step === 1 ? "Plan Your Ride" : step === 2 ? "Choose Vehicle" : "Confirm Booking"}
                  </p>
                  {serviceName && (
                    <p className="text-[11px] font-semibold text-[var(--color-primary)] mt-0.5">
                      Service: {serviceName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Step dots */}
                <div className="flex gap-1.5">
                  {STEP_LABELS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i + 1 === step
                          ? "w-5 bg-[var(--color-primary)]"
                          : i + 1 < step
                          ? "w-1.5 bg-[var(--color-primary)] opacity-40"
                          : "w-1.5 bg-[var(--color-border-strong)]"
                      }`}
                    />
                  ))}
                </div>
                <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-[var(--color-surface-muted)]">
                  <IconX size={15} />
                </button>
              </div>
            </div>

            {/* ── Scrollable body ───────────────────────────────────── */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* ══ Step 1 ══════════════════════════════════════════════ */}
              {step === 1 && (
                <>
                  {/* Service type tabs */}
                  <div className="flex rounded-xl border border-[var(--color-border)] overflow-hidden">
                    {SERVICE_TABS.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        onClick={() => setServiceTab(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold transition-colors ${
                          serviceTab === id
                            ? "bg-[var(--color-primary)] text-white"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                        }`}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* One Way / Round Trip toggle */}
                  <div className="flex gap-1 p-1 bg-[var(--color-surface-muted)] rounded-xl">
                    {TRIP_TABS.map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setTripTab(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold py-2 rounded-lg transition-colors ${
                          tripTab === id
                            ? "bg-[var(--color-surface)] shadow-sm text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {id === "roundtrip" && <IconRoundTrip size={11} />}
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Pickup */}
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Pickup Location</p>
                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors ${step1Error && !pickup.trim() ? "border-red-400" : "border-[var(--color-border)] focus-within:border-[var(--color-primary)]"}`}>
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] shrink-0" />
                      <input
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Enter pickup location"
                        className="flex-1 text-[14px] outline-none text-[var(--color-text-primary)] bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Pickup Date &amp; Time</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 py-2.5 focus-within:border-[var(--color-primary)]">
                        <IconCalendar size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="flex-1 text-[13px] text-[var(--color-text-secondary)] outline-none bg-transparent w-full"
                        />
                      </div>
                      <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 py-2.5 focus-within:border-[var(--color-primary)]">
                        <IconClock size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="flex-1 text-[13px] text-[var(--color-text-secondary)] outline-none bg-transparent w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Destination</p>
                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors ${step1Error && !destination.trim() ? "border-red-400" : "border-[var(--color-border)] focus-within:border-[var(--color-primary)]"}`}>
                      <div className="w-2.5 h-2.5 rounded bg-[var(--color-text-primary)] shrink-0" />
                      <input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Enter destination"
                        className="flex-1 text-[14px] outline-none text-[var(--color-text-primary)] bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Return date (round trip only) */}
                  {tripTab === "roundtrip" && (
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">Return Date</p>
                      <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 py-2.5 focus-within:border-[var(--color-primary)]">
                        <IconCalendar size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="flex-1 text-[13px] text-[var(--color-text-secondary)] outline-none bg-transparent w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Validation error */}
                  {step1Error && (
                    <p className="text-[12px] text-red-500 font-medium">{step1Error}</p>
                  )}
                </>
              )}

              {/* ══ Step 2 ══════════════════════════════════════════════ */}
              {step === 2 && (
                <>
                  {/* Route summary */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-muted)] rounded-xl text-[12px] font-semibold text-[var(--color-text-secondary)] flex-wrap">
                    <span className="text-[var(--color-primary)]">{pickup}</span>
                    <span>→</span>
                    <span>{destination}</span>
                    {date && <span className="ml-auto text-[var(--color-text-tertiary)]">{date}{time ? ` · ${time}` : ""}</span>}
                  </div>

                  {/* AC preference */}
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">AC Preference</p>
                    <div className="flex gap-2">
                      {[
                        { label: "AC",     value: true  as boolean | null },
                        { label: "Non-AC", value: false as boolean | null },
                        { label: "Any",    value: null  as boolean | null },
                      ].map(({ label, value }) => (
                        <button
                          key={label}
                          onClick={() => { setAcPref(value); setVehicle(""); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                            acPref === value
                              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                              : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                          }`}
                        >
                          {value === true && <IconWind size={12} />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seats filter */}
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Minimum Seats</p>
                    <div className="flex gap-2 flex-wrap">
                      {SEAT_OPTIONS.map(({ label, value }) => (
                        <button
                          key={label}
                          onClick={() => { setSeatFilter(value); setVehicle(""); }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                            seatFilter === value
                              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                              : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                          }`}
                        >
                          {value > 0 && <IconUsers size={11} />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle cards */}
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Available Vehicles</p>
                    {filteredVehicles.length === 0 ? (
                      <div className="text-center py-8 text-[13px] text-[var(--color-text-tertiary)]">
                        No vehicles available for this combination.
                        <br />Try changing your AC preference or seat filter.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredVehicles.map((v) => (
                          <VehicleCard
                            key={v.type}
                            vehicle={v}
                            selected={vehicle === v.type}
                            onSelect={() => setVehicle(v.type)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ══ Step 3 ══════════════════════════════════════════════ */}
              {step === 3 && selectedV && (
                <>
                  {/* Booking summary */}
                  <div className="bg-[var(--color-surface-muted)] rounded-2xl p-4 space-y-2 text-[13px]">
                    <p className="font-black text-[var(--color-text-primary)] mb-1">Booking Summary</p>
                    <SummaryRow label="Service" value={SERVICE_TABS.find(t => t.id === serviceTab)?.label ?? serviceTab} />
                    <SummaryRow label="Trip"    value={tripTab === "roundtrip" ? "Round Trip" : "One Way"} />
                    <SummaryRow label="From"    value={pickup} />
                    <SummaryRow label="To"      value={destination} />
                    {date && <SummaryRow label="Date"  value={date} />}
                    {time && <SummaryRow label="Time"  value={time} />}
                    {tripTab === "roundtrip" && returnDate && <SummaryRow label="Return" value={returnDate} />}
                  </div>

                  {/* Selected vehicle */}
                  <div className="flex items-center gap-4 px-4 py-3 bg-[var(--color-primary-light)] rounded-xl border border-[var(--color-primary)]/20">
                    <IconCar size={20} className="text-[var(--color-primary)]" />
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-[var(--color-text-primary)]">{selectedV.type}</p>
                      <p className="text-[12px] text-[var(--color-text-tertiary)]">
                        {selectedV.seats} seats · {selectedV.ac ? "AC" : "Non-AC"} · {selectedV.desc}
                      </p>
                    </div>
                    <p className="text-[15px] font-black text-[var(--color-primary)]">
                      ₹{selectedV.fare}<span className="text-[11px] font-medium text-[var(--color-text-tertiary)]">/{selectedV.fareUnit === "per km" ? "km" : selectedV.fareUnit}</span>
                    </p>
                  </div>

                  {/* Payment method */}
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

            {/* ── Fixed footer / CTA ────────────────────────────────── */}
            <div className="px-5 pb-5 pt-3 border-t border-[var(--color-border)] shrink-0">
              {step === 1 && (
                <Button
                  onPress={handleStep1Next}
                  className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 rounded-xl"
                >
                  See Available Cabs →
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
                  Confirm Booking{selectedV ? ` · ₹${selectedV.fare}/${selectedV.fareUnit === "per km" ? "km" : selectedV.fareUnit}` : ""}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VehicleCard({ vehicle, selected, onSelect }: { vehicle: Vehicle; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left ${
        selected
          ? "bg-[var(--color-primary-light)] border-[var(--color-primary)]"
          : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
      }`}
    >
      <IconCar size={20} className={selected ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]"} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[var(--color-text-primary)] truncate">{vehicle.type}</p>
        <p className="text-[11px] text-[var(--color-text-tertiary)]">
          {vehicle.seats} seats · {vehicle.ac ? "AC" : "Non-AC"} · ETA {vehicle.eta}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[15px] font-black text-[var(--color-primary)]">₹{vehicle.fare}</p>
        <p className="text-[10px] text-[var(--color-text-tertiary)]">{vehicle.fareUnit}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0">
          <IconCheck size={11} className="text-white" strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-text-tertiary)]">{label}</span>
      <span className="font-semibold text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

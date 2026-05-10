"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { useVehicles, useRecentPlaces, useCreateBooking } from "@/hooks/useBooking";
import { PAYMENT_OPTIONS } from "@/data/booking.mock";
import { IconX, IconChevronLeft, IconMapPin, IconCar, IconCheck, IconCheckCircle } from "@/constants/icons";

interface BookRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBooked: () => void;
}

export function BookRideModal({ isOpen, onClose, onBooked }: BookRideModalProps) {
  const [step, setStep]         = useState<1 | 2>(1);
  const [pickup, setPickup]     = useState("");
  const [dropoff, setDropoff]   = useState("");
  const [vehicle, setVehicle]   = useState("Sedan");
  const [payment, setPayment]   = useState("UPI");
  const [confirmed, setConfirmed] = useState(false);

  const { data: vehicles = [] }      = useVehicles();
  const { data: recentPlaces = [] }  = useRecentPlaces();
  const { mutate: book, isPending }  = useCreateBooking();

  function reset() {
    setStep(1); setPickup(""); setDropoff(""); setVehicle("Sedan"); setPayment("UPI"); setConfirmed(false);
  }
  function handleClose() { reset(); onClose(); }
  function handleConfirm() {
    book(
      { pickup: pickup || "Current Location", dropoff: dropoff || "Technopark Phase 3", vehicleType: vehicle, payment },
      {
        onSuccess: () => {
          setConfirmed(true);
          setTimeout(() => { reset(); onBooked(); onClose(); }, 1800);
        },
      }
    );
  }

  const selectedV = vehicles.find((v) => v.type === vehicle) ?? vehicles[0];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] mr-1">
                    <IconChevronLeft size={16} />
                  </button>
                )}
                <p className="text-[16px] font-black text-[var(--color-text-primary)]">
                  {step === 1 ? "Where to?" : "Choose Ride"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[1, 2].map((s) => (
                    <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? "w-5 bg-[var(--color-primary)]" : "w-1.5 bg-[var(--color-border-strong)]"}`} />
                  ))}
                </div>
                <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-[var(--color-surface-muted)]">
                  <IconX size={15} />
                </button>
              </div>
            </div>

            {step === 1 && (
              <div className="p-5 space-y-4">
                <div className="bg-[var(--color-surface-muted)] rounded-2xl p-4 space-y-3">
                  {[
                    { label: "Pick Up", value: pickup, set: setPickup, dot: "rounded-full bg-[var(--color-primary)]", placeholder: "Tap to set pickup…" },
                    { label: "Drop Off", value: dropoff, set: setDropoff, dot: "rounded bg-[var(--color-text-primary)]", placeholder: "Where are you going?" },
                  ].map(({ label, value, set, dot, placeholder }) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-1.5">{label}</p>
                      <div className="flex items-center gap-2 bg-[var(--color-surface)] rounded-xl px-3 py-2.5 shadow-sm border border-transparent focus-within:border-[var(--color-primary)]">
                        <div className={`w-2.5 h-2.5 shrink-0 ${dot}`} />
                        <input
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          placeholder={placeholder}
                          className="flex-1 text-[14px] outline-none text-[var(--color-text-primary)] bg-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Recent Places</p>
                  <div className="space-y-1.5">
                    {recentPlaces.map((p) => (
                      <button key={p.label} onClick={() => setDropoff(p.label)} className="w-full flex items-center gap-3 px-3 py-2.5 bg-[var(--color-surface-muted)] hover:bg-[var(--color-border)] rounded-xl transition-colors text-left">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] shadow-sm flex items-center justify-center shrink-0">
                          <IconMapPin size={14} className="text-[var(--color-text-tertiary)]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{p.label}</p>
                          <p className="text-[11px] text-[var(--color-text-tertiary)]">{p.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onPress={() => { if (!pickup) setPickup("Current Location"); if (!dropoff) setDropoff("Technopark Phase 3"); setStep(2); }} className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 rounded-xl">
                  See Available Rides →
                </Button>
              </div>
            )}

            {step === 2 && selectedV && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] bg-[var(--color-surface-muted)] rounded-xl overflow-hidden border border-[var(--color-border)]">
                  <div className="px-4 py-3"><p className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase tracking-wider">From</p><p className="text-[13px] font-bold text-[var(--color-primary)] truncate mt-0.5">{pickup}</p></div>
                  <div className="px-4 py-3"><p className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase tracking-wider">To</p><p className="text-[13px] font-bold text-[var(--color-text-primary)] truncate mt-0.5">{dropoff}</p></div>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Choose Vehicle</p>
                  <div className="space-y-2">
                    {vehicles.map((v) => (
                      <button
                        key={v.type}
                        onClick={() => setVehicle(v.type)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left ${vehicle === v.type ? "bg-[var(--color-primary-light)] border-[var(--color-primary)]" : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}
                      >
                        <IconCar size={20} className={vehicle === v.type ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]"} />
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-[var(--color-text-primary)]">{v.type}</p>
                          <p className="text-[12px] text-[var(--color-text-tertiary)]">{v.desc} · {v.seats} seats · ETA {v.eta}</p>
                        </div>
                        <p className="text-[16px] font-black text-[var(--color-primary)]">₹{v.fare}</p>
                        {vehicle === v.type && <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center"><IconCheck size={11} className="text-white" strokeWidth={2.5} /></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Payment Method</p>
                  <div className="flex gap-2">
                    {PAYMENT_OPTIONS.map((m) => (
                      <button key={m} onClick={() => setPayment(m)} className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${payment === m ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onPress={handleConfirm} isLoading={isPending} className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 rounded-xl">
                  <IconCheck size={16} className="mr-1.5" /> Confirm Booking · ₹{selectedV.fare}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

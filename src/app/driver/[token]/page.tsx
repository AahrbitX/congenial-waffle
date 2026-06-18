"use client";

import { useState, useEffect, useRef, use } from "react";
import {
  IconCar,
  IconCalendar,
  IconClock,
  IconPhone,
  IconUsers,
  IconCheckCircle,
  IconLoader,
  IconNavigation,
  IconXCircle,
  IconRefreshCw,
  IconShield,
} from "@/constants/icons";

type RideData = {
  id: string;
  bookingRef: string;
  status: string;
  customerName: string;
  customerPhone: string;
  journeyDate: string;
  journeyTime: string;
  totalFare: string;
  vehicleType: string;
  ac: boolean;
  members: number;
  pickupName: string;
  dropName: string;
  totalPaid: string;
  balanceDue: string;
  paymentId: string | null;
  paymentStatus: string | null;
  paymentAmount: string | null;
  paymentMethod: string | null;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function isRideTimeReached(journeyDate: string, journeyTime: string) {
  const [year, month, day] = journeyDate.split("-").map(Number);
  const [hour, minute] = journeyTime.split(":").map(Number);
  const rideAt = new Date(year, month - 1, day, hour, minute).getTime();
  return Date.now() >= rideAt;
}

// OTP input component — 4 separate digit boxes
function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(4, " ").split("").slice(0, 4);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => idx === i ? " " : d).join("").trimEnd();
      onChange(next);
      if (i > 0) inputRefs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => idx === i ? (char || " ") : d).join("").trimEnd();
    onChange(next);
    if (char && i < 3) inputRefs.current[i + 1]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          disabled={disabled}
          className="w-14 h-14 text-center text-2xl font-black text-primary bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
}

export default function DriverRidePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [ride, setRide] = useState<RideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [timeReached, setTimeReached] = useState(false);
  const [otp, setOtp] = useState("");
  const [starting, setStarting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [cashCode, setCashCode] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [endingRide, setEndingRide] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch(`/api/driver/${token}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) { setError(res.message ?? "Ride not found"); return; }
        setRide(res.data);
        if (res.data.status === "ongoing") setStarted(true);
        if (parseFloat(res.data.balanceDue ?? "0") <= 0) setPaymentConfirmed(true);
        setTimeReached(isRideTimeReached(res.data.journeyDate, res.data.journeyTime));
      })
      .catch(() => setError("Failed to load ride details."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!ride || started) return;
    const interval = setInterval(() => {
      setTimeReached(isRideTimeReached(ride.journeyDate, ride.journeyTime));
    }, 30_000);
    return () => clearInterval(interval);
  }, [ride, started]);

  const handleStartRide = async () => {
    if (otp.trim().length < 4) { setOtpError("Please enter the 4-digit OTP from the customer."); return; }
    setStarting(true);
    setOtpError(null);
    try {
      const res = await fetch(`/api/driver/${token}/start`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const data = await res.json();
      if (data.success) { setStarted(true); }
      else { setOtpError(data.message ?? "Failed to start ride"); }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!cashCode.trim()) return;
    setVerifyingPayment(true);
    setPaymentError(null);
    try {
      const res = await fetch(`/api/driver/${token}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cashCode.trim() }),
      });
      const data = await res.json();
      if (data.success) { setPaymentConfirmed(true); setCashCode(""); }
      else { setPaymentError(data.message ?? "Invalid OTP. Please try again."); }
    } catch {
      setPaymentError("Network error. Please try again.");
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleEndRide = async () => {
    setEndingRide(true);
    try {
      const res = await fetch(`/api/driver/${token}/end`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) { setRide((prev) => prev ? { ...prev, status: "completed" } : prev); }
      else { alert(data.message ?? "Failed to end ride"); }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setEndingRide(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/driver/${token}`);
      const data = await res.json();
      if (data.success) {
        setRide(data.data);
        if (parseFloat(data.data.balanceDue ?? "0") <= 0) setPaymentConfirmed(true);
      }
    } catch { /* silent */ }
    finally { setRefreshing(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <IconLoader size={32} className="animate-spin text-primary" />
          <p className="text-sm text-text-tertiary">Loading ride details…</p>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-danger/10 flex items-center justify-center">
          <IconCar size={26} className="text-danger" />
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary">Ride Not Found</p>
          <p className="text-sm text-text-tertiary mt-1">{error ?? "This link may have expired or is invalid."}</p>
        </div>
      </div>
    );
  }

  if (ride.status === "completed") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-success px-5 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <IconCheckCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Mohan Cabs — Driver</p>
              <p className="text-white font-bold text-xl leading-tight">#{ride.bookingRef}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
            ✓ Ride Completed
          </span>
        </div>
        <div className="p-5 max-w-md mx-auto space-y-4">
          <div className="rounded-2xl border border-success/30 bg-success/5 p-5 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
              <IconCheckCircle size={28} className="text-success" />
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">Ride completed successfully</p>
              <p className="text-sm text-text-secondary mt-1">
                Trip for <span className="font-semibold">{ride.customerName}</span> on{" "}
                <span className="font-semibold">{formatDate(ride.journeyDate)}</span> at{" "}
                <span className="font-semibold">{formatTime(ride.journeyTime)}</span>
              </p>
            </div>
          </div>
          <RouteCard pickupName={ride.pickupName} dropName={ride.dropName} fare={ride.totalFare} fareColor="text-success" />
          <CustomerCard name={ride.customerName} phone={ride.customerPhone} />
        </div>
      </div>
    );
  }

  if (ride.status === "cancelled") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-danger px-5 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <IconXCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Mohan Cabs — Driver</p>
              <p className="text-white font-bold text-xl leading-tight">#{ride.bookingRef}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
            ✕ Ride Cancelled
          </span>
        </div>
        <div className="p-5 max-w-md mx-auto space-y-4">
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center">
              <IconXCircle size={28} className="text-danger" />
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">This ride has been cancelled</p>
              <p className="text-sm text-text-secondary mt-1">
                Booking for <span className="font-semibold">{ride.customerName}</span> on{" "}
                <span className="font-semibold">{formatDate(ride.journeyDate)}</span> is no longer active.
              </p>
            </div>
          </div>
          <CustomerCard name={ride.customerName} phone={ride.customerPhone} />
        </div>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ride.pickupName)}&destination=${encodeURIComponent(ride.dropName)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className={`px-5 pt-12 pb-8 ${started ? "bg-primary" : "bg-primary"}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
            <IconCar size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium">Mohan Cabs — Driver</p>
            <p className="text-white font-bold text-xl leading-tight">#{ride.bookingRef}</p>
          </div>
        </div>
        <div className="mt-2">
          {started ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Ride in Progress
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400/25 text-yellow-200">
              ● Confirmed — Enter OTP to Start
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4 max-w-md mx-auto">

        {/* Route card */}
        <RouteCard pickupName={ride.pickupName} dropName={ride.dropName} fare={ride.totalFare} fareColor="text-primary" />

        {/* Maps link */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary/8 border border-primary/20 text-primary py-3 text-sm font-bold hover:bg-primary/15 transition-colors"
        >
          <IconNavigation size={16} />
          Open in Google Maps
        </a>

        {/* Journey info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <IconCalendar size={16} className="text-primary" />, label: "Date", value: formatDate(ride.journeyDate) },
            { icon: <IconClock size={16} className="text-primary" />, label: "Time", value: formatTime(ride.journeyTime) },
            { icon: <IconCar size={16} className="text-primary" />, label: "Vehicle", value: ride.vehicleType.charAt(0).toUpperCase() + ride.vehicleType.slice(1) },
            { icon: <IconUsers size={16} className="text-primary" />, label: "Passengers", value: `${ride.members} · ${ride.ac ? "AC" : "Non-AC"}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <p className="text-[10px] text-text-tertiary">{label}</p>
                <p className="text-xs font-bold text-text-primary">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Customer card */}
        <CustomerCard name={ride.customerName} phone={ride.customerPhone} />

        {/* ── OTP entry / started state ── */}
        {started ? (
          <div className="rounded-2xl border border-success/30 bg-success/8 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
              <IconCheckCircle size={22} className="text-success" />
            </div>
            <div>
              <p className="text-sm font-bold text-success">Ride in Progress</p>
              <p className="text-xs text-text-secondary mt-0.5">Drive safely and have a great trip!</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-primary/20 bg-surface p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <IconShield size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Enter Customer OTP</p>
                <p className="text-xs text-text-tertiary">Ask the customer for their 4-digit ride OTP</p>
              </div>
            </div>

            <OtpInput value={otp} onChange={setOtp} disabled={!timeReached || starting} />

            {otpError && (
              <p className="text-xs text-danger font-medium text-center">{otpError}</p>
            )}

            {!timeReached && (
              <p className="text-xs text-center text-text-tertiary">
                OTP entry will be enabled at the scheduled time
              </p>
            )}

            <button
              onClick={handleStartRide}
              disabled={!timeReached || starting || otp.trim().length < 4}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-all ${
                timeReached && !starting && otp.trim().length >= 4
                  ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
                  : "bg-surface-muted text-text-tertiary cursor-not-allowed"
              }`}
            >
              {starting ? (
                <><IconLoader size={18} className="animate-spin" /> Verifying…</>
              ) : (
                <><IconCar size={18} /> Confirm & Start Ride</>
              )}
            </button>
          </div>
        )}

        {/* ── Payment section ── */}
        {started && (() => {
          const balanceDueAmt = parseFloat(ride.balanceDue ?? "0");
          const fullyPaid = paymentConfirmed || balanceDueAmt <= 0;
          const cashPending = ride.paymentStatus === "cash_pending" && !paymentConfirmed;
          const amount = parseFloat(ride.paymentAmount ?? ride.balanceDue ?? "0").toLocaleString("en-IN");

          return (
            <>
              {fullyPaid && (
                <div className="rounded-2xl border border-success/30 bg-success/8 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
                      <IconCheckCircle size={20} className="text-success" />
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-success/20 text-success mb-0.5">
                        Fully Paid
                      </span>
                      <p className="text-xs text-text-secondary">
                        ₹{parseFloat(ride.totalPaid).toLocaleString("en-IN")} of ₹{parseFloat(ride.totalFare).toLocaleString("en-IN")} collected
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-black text-success">₹{parseFloat(ride.totalFare).toLocaleString("en-IN")}</p>
                </div>
              )}

              {!fullyPaid && !cashPending && (
                <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-danger/15 text-danger mb-1">
                        Balance Due
                      </span>
                      <p className="text-xs text-text-secondary">
                        ₹{parseFloat(ride.totalPaid).toLocaleString("en-IN")} paid · ₹{parseFloat(ride.balanceDue).toLocaleString("en-IN")} remaining
                      </p>
                    </div>
                    <p className="text-2xl font-black text-danger">₹{parseFloat(ride.balanceDue).toLocaleString("en-IN")}</p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors disabled:opacity-50"
                  >
                    <IconRefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? "Checking…" : "Refresh Payment Status"}
                  </button>
                </div>
              )}

              {cashPending && (
                <div className="rounded-2xl border border-warning/40 bg-warning/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-warning/20 text-warning mb-1">
                        Cash OTP Pending
                      </span>
                      <p className="text-xs text-text-secondary">Ask customer to read their WhatsApp OTP</p>
                    </div>
                    <p className="text-2xl font-black text-warning">₹{amount}</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cashCode}
                      onChange={(e) => { setCashCode(e.target.value.toUpperCase()); setPaymentError(null); }}
                      placeholder="Enter payment OTP"
                      maxLength={6}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-mono font-bold tracking-widest text-text-primary placeholder:text-text-tertiary placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleVerifyPayment}
                      disabled={verifyingPayment || cashCode.length < 6}
                      className={`px-4 rounded-xl text-sm font-bold transition-all ${
                        !verifyingPayment && cashCode.length >= 6
                          ? "bg-warning text-white hover:bg-warning/90 active:scale-95"
                          : "bg-surface-muted text-text-tertiary cursor-not-allowed"
                      }`}
                    >
                      {verifyingPayment ? <IconLoader size={16} className="animate-spin" /> : "Confirm"}
                    </button>
                  </div>
                  {paymentError && <p className="text-xs text-danger font-medium">{paymentError}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                {!fullyPaid && (
                  <p className="text-xs text-center text-text-tertiary">
                    {cashPending ? "Confirm payment OTP above to end the ride" : "Payment must be completed before ending the ride"}
                  </p>
                )}
                <button
                  onClick={handleEndRide}
                  disabled={endingRide || !fullyPaid}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-all ${
                    !endingRide && fullyPaid
                      ? "bg-danger text-white hover:bg-danger/90 active:scale-[0.98]"
                      : "bg-surface-muted text-text-tertiary cursor-not-allowed"
                  }`}
                >
                  {endingRide ? (
                    <><IconLoader size={18} className="animate-spin" /> Ending Ride…</>
                  ) : (
                    <><IconCheckCircle size={18} /> End Ride</>
                  )}
                </button>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function RouteCard({
  pickupName,
  dropName,
  fare,
  fareColor,
}: {
  pickupName: string;
  dropName: string;
  fare: string;
  fareColor: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-stretch gap-3 mb-3">
        <div className="flex flex-col items-center py-0.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-primary mt-0.5" />
          <div className="flex-1 w-px bg-border my-1" />
          <div className="w-2.5 h-2.5 rounded-full bg-danger mb-0.5" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wide font-semibold">Pick Up</p>
            <p className="text-sm font-bold text-text-primary">{pickupName}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wide font-semibold">Drop Off</p>
            <p className="text-sm font-bold text-text-primary">{dropName}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <p className="text-xs text-text-tertiary">Total Fare</p>
        <p className={`text-2xl font-black ${fareColor}`}>₹{parseFloat(fare).toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}

function CustomerCard({ name, phone }: { name: string; phone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-black text-lg">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary truncate">{name}</p>
        <a href={`tel:${phone}`} className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-0.5 hover:underline">
          <IconPhone size={11} /> {phone}
        </a>
      </div>
      <a
        href={`tel:${phone}`}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
      >
        <IconPhone size={13} /> Call
      </a>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
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

export default function DriverRidePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [ride, setRide] = useState<RideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeReached, setTimeReached] = useState(false);

  useEffect(() => {
    fetch(`/api/driver/${token}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) { setError(res.message ?? "Ride not found"); return; }
        setRide(res.data);
        if (res.data.status === "ongoing") setStarted(true);
        setTimeReached(isRideTimeReached(res.data.journeyDate, res.data.journeyTime));
      })
      .catch(() => setError("Failed to load ride details."))
      .finally(() => setLoading(false));
  }, [token]);

  // Re-check time every minute
  useEffect(() => {
    if (!ride || started) return;
    const interval = setInterval(() => {
      setTimeReached(isRideTimeReached(ride.journeyDate, ride.journeyTime));
    }, 30_000);
    return () => clearInterval(interval);
  }, [ride, started]);

  const handleStartRide = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/driver/${token}/start`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) { setStarted(true); }
      else { alert(data.message ?? "Failed to start ride"); }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <IconLoader size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center">
          <IconCar size={24} className="text-danger" />
        </div>
        <p className="text-lg font-bold text-text-primary">Ride Not Found</p>
        <p className="text-sm text-text-secondary">{error ?? "This link may have expired or is invalid."}</p>
      </div>
    );
  }

  if (ride.status === "completed") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-success px-5 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <IconCheckCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Mohan Cabs — Driver Ride Sheet</p>
              <p className="text-white font-bold text-lg leading-tight">#{ride.bookingRef}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
              ✓ Ride Completed
            </span>
          </div>
        </div>

        <div className="p-5 max-w-md mx-auto space-y-4">
          <div className="rounded-2xl border border-success/30 bg-success/5 p-5 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
              <IconCheckCircle size={26} className="text-success" />
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">Ride completed successfully</p>
              <p className="text-sm text-text-secondary mt-1">
                Trip for <span className="font-semibold">{ride.customerName}</span> on{" "}
                <span className="font-semibold">{formatDate(ride.journeyDate)}</span> at{" "}
                <span className="font-semibold">{formatTime(ride.journeyTime)}</span> is done.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <div className="w-px h-8 bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-danger" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[11px] text-text-tertiary uppercase tracking-wide font-semibold">Pick Up</p>
                  <p className="text-sm font-semibold text-text-primary">{ride.pickupName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-tertiary uppercase tracking-wide font-semibold">Drop Off</p>
                  <p className="text-sm font-semibold text-text-primary">{ride.dropName}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <p className="text-xs text-text-tertiary">Total Fare</p>
              <p className="text-lg font-black text-success">₹{parseFloat(ride.totalFare).toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
              {ride.customerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">{ride.customerName}</p>
              <a href={`tel:${ride.customerPhone}`} className="flex items-center gap-1 text-xs text-primary font-medium">
                <IconPhone size={11} /> {ride.customerPhone}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (ride.status === "cancelled") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-danger px-5 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <IconXCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Mohan Cabs — Driver Ride Sheet</p>
              <p className="text-white font-bold text-lg leading-tight">#{ride.bookingRef}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
              ● Ride Cancelled
            </span>
          </div>
        </div>

        <div className="p-5 max-w-md mx-auto space-y-4">
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center">
              <IconXCircle size={26} className="text-danger" />
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">This ride has been cancelled</p>
              <p className="text-sm text-text-secondary mt-1">
                The booking for <span className="font-semibold">{ride.customerName}</span> on{" "}
                <span className="font-semibold">{formatDate(ride.journeyDate)}</span> at{" "}
                <span className="font-semibold">{formatTime(ride.journeyTime)}</span> is no longer active.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
              {ride.customerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">{ride.customerName}</p>
              <a href={`tel:${ride.customerPhone}`} className="flex items-center gap-1 text-xs text-primary font-medium">
                <IconPhone size={11} /> {ride.customerPhone}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ride.pickupName)}&destination=${encodeURIComponent(ride.dropName)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-5 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <IconCar size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium">Mohan Cabs — Driver Ride Sheet</p>
            <p className="text-white font-bold text-lg leading-tight">#{ride.bookingRef}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            started ? "bg-white/20 text-white" : "bg-yellow-400/20 text-yellow-200"
          }`}>
            {started ? "● Ride in Progress" : "● Confirmed — Awaiting Start"}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4 max-w-md mx-auto">

        {/* Route card */}
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="w-px h-8 bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[11px] text-text-tertiary uppercase tracking-wide font-semibold">Pick Up</p>
                <p className="text-sm font-semibold text-text-primary">{ride.pickupName}</p>
              </div>
              <div>
                <p className="text-[11px] text-text-tertiary uppercase tracking-wide font-semibold">Drop Off</p>
                <p className="text-sm font-semibold text-text-primary">{ride.dropName}</p>
              </div>
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary/10 text-primary py-2.5 text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            <IconNavigation size={15} />
            Open in Google Maps
          </a>
        </div>

        {/* Journey details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-surface p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center shrink-0">
              <IconCalendar size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary">Date</p>
              <p className="text-xs font-bold text-text-primary">{formatDate(ride.journeyDate)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center shrink-0">
              <IconClock size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary">Time</p>
              <p className="text-xs font-bold text-text-primary">{formatTime(ride.journeyTime)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center shrink-0">
              <IconCar size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary">Vehicle</p>
              <p className="text-xs font-bold text-text-primary capitalize">{ride.vehicleType}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center shrink-0">
              <IconUsers size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary">Passengers</p>
              <p className="text-xs font-bold text-text-primary">{ride.members} · {ride.ac ? "AC" : "Non-AC"}</p>
            </div>
          </div>
        </div>

        {/* Customer + fare */}
        <div className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
            {ride.customerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{ride.customerName}</p>
            <a href={`tel:${ride.customerPhone}`} className="flex items-center gap-1 text-xs text-primary font-medium">
              <IconPhone size={11} /> {ride.customerPhone}
            </a>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-text-tertiary">Fare</p>
            <p className="text-lg font-black text-primary">₹{parseFloat(ride.totalFare).toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Start Ride / Started state */}
        {started ? (
          <div className="rounded-2xl border border-success/30 bg-success/8 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
              <IconCheckCircle size={20} className="text-success" />
            </div>
            <div>
              <p className="text-sm font-bold text-success">Ride in Progress</p>
              <p className="text-xs text-text-secondary">Drive safe and have a great trip!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {!timeReached && (
              <p className="text-xs text-center text-text-tertiary">
                "Start Ride" will be enabled at the scheduled time
              </p>
            )}
            <button
              onClick={handleStartRide}
              disabled={!timeReached || starting}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-all ${
                timeReached && !starting
                  ? "bg-primary text-white hover:bg-primary/90 active:scale-95"
                  : "bg-surface-muted text-text-tertiary cursor-not-allowed"
              }`}
            >
              {starting ? (
                <><IconLoader size={18} className="animate-spin" /> Starting…</>
              ) : (
                <><IconCar size={18} /> Start Ride</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

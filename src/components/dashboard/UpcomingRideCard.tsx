"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconCar,
  IconCalendar,
  IconClock,
  IconEye,
  IconXCircle,
  IconShield,
  IconPhone,
} from "@/constants/icons";
import { useCancelRide } from "@/hooks/useRides";
import type { Ride } from "@/types/ride.types";

interface UpcomingRideCardProps {
  ride: Ride;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
}

export function UpcomingRideCard({ ride }: UpcomingRideCardProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelRide = useCancelRide();

  const hasDriver   = !!ride.driver;
  const statusLabel = hasDriver ? "Driver Assigned" : "Awaiting Driver";

  const handleCancel = async () => {
    await cancelRide.mutateAsync(ride.id);
    setConfirmCancel(false);
  };

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
            <IconCar size={19} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-[var(--color-text-primary)] leading-tight">Upcoming Ride</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)] font-mono mt-0.5">#{ride.bookingRef}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
          hasDriver
            ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/8 text-[var(--color-success)]"
            : "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/8 text-[var(--color-warning)]"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${hasDriver ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)] animate-pulse"}`} />
          {statusLabel}
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]" />

      {/* ── Route + Fare ── */}
      <div className="flex items-stretch gap-4 px-5 py-5">
        {/* Vertical route indicator */}
        <div className="flex flex-col items-center py-1 shrink-0">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
          </div>
          <div className="w-px flex-1 border-l-2 border-dashed border-[var(--color-border)] my-1.5" />
          <div className="w-5 h-5 rounded-full border-2 border-[var(--color-danger)] bg-[var(--color-surface)] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
          </div>
        </div>

        {/* Place names */}
        <div className="flex-1 min-w-0 space-y-3.5 py-0.5">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Pick Up</p>
            <p className="text-sm font-bold text-[var(--color-text-primary)] leading-snug">{ride.from}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Drop Off</p>
            <p className="text-sm font-bold text-[var(--color-text-primary)] leading-snug">{ride.to}</p>
          </div>
        </div>

        {/* Fare pill */}
        <div className="shrink-0 flex flex-col items-center justify-center bg-[var(--color-primary)]/8 rounded-2xl px-4 py-3.5 min-w-[92px] text-center self-center">
          <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">Fare</p>
          <p className="text-2xl font-black text-[var(--color-primary)]">₹{ride.fare.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]" />

      {/* ── Date / Time / Vehicle ── */}
      <div className="grid grid-cols-3 divide-x divide-[var(--color-border)]">
        {[
          { icon: <IconCalendar size={15} className="text-[var(--color-text-tertiary)]" />, label: "DATE",    value: formatDate(ride.journeyDate) },
          { icon: <IconClock    size={15} className="text-[var(--color-text-tertiary)]" />, label: "TIME",    value: formatTime(ride.journeyTime) },
          { icon: <IconCar      size={15} className="text-[var(--color-text-tertiary)]" />, label: "VEHICLE", value: capitalize(ride.vehicleType) },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5 px-4 py-4">
            {icon}
            <div>
              <p className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Driver row (when assigned) ── */}
      {hasDriver && (
        <>
          <div className="border-t border-[var(--color-border)]" />
          <div className="flex items-center gap-3.5 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center shrink-0">
              <span className="text-[var(--color-success)] font-black text-sm">
                {ride.driver!.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Your Driver</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)] truncate mt-0.5">{ride.driver}</p>
              {ride.driverPhone && (
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{ride.driverPhone}</p>
              )}
            </div>
            {ride.driverPhone && (
              <a
                href={`tel:${ride.driverPhone}`}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
              >
                <IconPhone size={13} />
                Call
              </a>
            )}
          </div>
        </>
      )}

      {/* ── OTP box (when confirmed) ── */}
      {ride.status === "confirmed" && ride.rideStartOtp && (
        <>
          <div className="border-t border-[var(--color-border)]" />
          <div className="flex items-center gap-3.5 px-5 py-4 bg-[var(--color-primary)]/5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
              <IconShield size={17} className="text-[var(--color-primary)]" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Ride Start OTP</p>
              <p className="text-2xl font-black text-[var(--color-primary)] tracking-[0.2em] leading-tight mt-0.5">
                {ride.rideStartOtp}
              </p>
            </div>
            <p className="text-[9px] text-[var(--color-text-tertiary)] text-right leading-relaxed shrink-0">
              Share with<br />driver on arrival
            </p>
          </div>
        </>
      )}

      <div className="border-t border-[var(--color-border)]" />

      {/* ── Actions ── */}
      <div className="p-4">
        {confirmCancel ? (
          <div className="rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-4 space-y-3">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Cancel this ride?</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-2xl border border-[var(--color-border)] py-3 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors"
                onClick={() => setConfirmCancel(false)}
              >
                Keep Ride
              </button>
              <button
                className="flex-1 rounded-2xl bg-[var(--color-danger)] py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                onClick={handleCancel}
                disabled={cancelRide.isPending}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <button
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] py-3.5 text-sm font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-colors"
              onClick={() => setConfirmCancel(true)}
            >
              <IconXCircle size={15} />
              Cancel
            </button>
            <Link href={`/dashboard/rides/${ride.id}`} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] py-3.5 text-sm font-bold text-white hover:opacity-90 transition-opacity">
                <IconEye size={15} />
                View Details
              </button>
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}

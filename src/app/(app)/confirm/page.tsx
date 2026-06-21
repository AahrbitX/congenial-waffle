"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRideById } from "@/api/rides.api";
import type { Ride } from "@/types/ride.types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided.");
      setLoading(false);
      return;
    }
    getRideById(bookingId)
      .then(setRide)
      .catch(() => setError("Failed to load booking details."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-7 h-7 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center bg-[var(--color-background)]">
        <div className="w-16 h-16 rounded-3xl bg-[var(--color-danger)]/10 flex items-center justify-center text-3xl">⚠</div>
        <p className="text-lg font-bold text-[var(--color-text-primary)]">Unable to load booking</p>
        <p className="text-sm text-[var(--color-text-tertiary)]">{error ?? "Booking not found."}</p>
        <button
          onClick={() => router.push("/dashboard/rides")}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold"
        >
          View My Rides
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] px-5 pt-12 pb-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mx-auto mb-3">✓</div>
        <p className="text-white font-black text-xl">Booking Confirmed!</p>
        <p className="text-white/70 text-sm mt-1">#{ride.bookingRef}</p>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-4 pb-28">

        {/* Route */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-stretch gap-3">
            <div className="flex flex-col items-center py-0.5 shrink-0">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-0.5" />
              <div className="flex-1 w-px bg-[var(--color-border)] my-1" />
              <div className="w-2 h-2 rounded-full bg-[var(--color-danger)] mb-0.5" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Pick Up</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{ride.from}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Drop Off</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{ride.to}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Journey details */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold mb-0.5">Date</p>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">
              {ride.journeyDate ? formatDate(ride.journeyDate) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold mb-0.5">Time</p>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">
              {ride.journeyTime ? formatTime(ride.journeyTime) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold mb-0.5">Vehicle</p>
            <p className="text-sm font-bold text-[var(--color-text-primary)] capitalize">{ride.vehicleType || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold mb-0.5">Total Fare</p>
            <p className="text-sm font-bold text-[var(--color-primary)]">
              ₹{ride.fare.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Status note */}
        <div className="rounded-2xl bg-[var(--color-primary)]/8 border border-[var(--color-primary)]/20 p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            A driver will be assigned to your booking shortly. You will receive a WhatsApp notification once confirmed.
          </p>
        </div>
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-background)] border-t border-[var(--color-border)]">
        <button
          onClick={() => router.push("/dashboard/rides")}
          className="w-full max-w-md mx-auto flex items-center justify-center rounded-2xl py-4 text-base font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 active:scale-[0.98] transition-all"
        >
          View My Rides
        </button>
      </div>
    </div>
  );
}

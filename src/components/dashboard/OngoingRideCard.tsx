"use client";

import { useState } from "react";
import { IconCreditCard, IconLoader, IconCar, IconMapPin } from "@/constants/icons";
import { Navigation } from "lucide-react";
import { useEndTrip } from "@/hooks/useRides";
import { useRazorpayPayment } from "@/hooks/useTransactions";
import { authClient } from "@/lib/auth-client";
import { PayToDriverModal } from "@/features/dashboard/transactions/PayToDriverModal";
import type { Ride } from "@/types/ride.types";
import type { UserTransaction } from "@/types/transactions.types";

interface OngoingRideCardProps {
  ride: Ride;
  onEndTrip: (ride: Ride) => void;
}

export function OngoingRideCard({ ride, onEndTrip }: OngoingRideCardProps) {
  const endTrip = useEndTrip();
  const { pay } = useRazorpayPayment();
  const { data: session } = authClient.useSession();

  const [payToDriverOpen, setPayToDriverOpen] = useState(false);
  const [endingTrip, setEndingTrip] = useState(false);

  const hasBalanceDue  = ride.paidAmount > 0 && ride.fare > ride.paidAmount;
  const balanceAmount  = hasBalanceDue ? Math.max(0, ride.fare - ride.paidAmount) : 0;

  const doEndTrip = async () => {
    setEndingTrip(true);
    try {
      await endTrip.mutateAsync(ride.id);
      onEndTrip(ride);
    } finally {
      setEndingTrip(false);
    }
  };

  const handlePayNow = () => {
    pay({
      bookingId: ride.id,
      amount:    balanceAmount,
      mode:      "balance",
      userName:  session?.user?.name ?? "",
      userPhone: (session?.user as any)?.phoneNumber ?? "",
    });
  };

  const balanceTx: UserTransaction = {
    id:            ride.paymentId ?? ride.id,
    bookingId:     ride.id,
    rzpOrderId:    "",
    rzpPaymentId:  null,
    amount:        String(ride.paidAmount),
    currency:      "INR",
    status:        "paid",
    mode:          "partial",
    paymentMethod: "online",
    paidAt:        null,
    cashVerifiedAt:   null,
    adminVerifiedBy:  null,
    adminVerifiedAt:  null,
    createdAt:     "",
    bookingRef:    ride.bookingRef,
    journeyDate:   ride.journeyDate,
    journeyTime:   ride.journeyTime,
    totalFare:     String(ride.fare),
    bookingStatus: "ongoing",
    driverId:      ride.driver ? "assigned" : null,
    pickupName:    ride.from,
    dropName:      ride.to,
  };

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
          <p className="text-[15px] font-bold text-[var(--color-text-primary)]">Ride in Progress</p>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] font-mono">#{ride.bookingRef}</p>
      </div>

      <div className="border-t border-[var(--color-border)]" />

      <div className="px-5 py-5 space-y-4">

        {/* ── Route + Fare ── */}
        <div className="flex items-stretch gap-4">
          {/* Vertical route line */}
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
              <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{ride.from}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Drop Off</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{ride.to}</p>
            </div>
          </div>

          {/* Fare */}
          <div className="shrink-0 flex flex-col items-end justify-center bg-[var(--color-primary)]/8 rounded-2xl px-4 py-3.5 min-w-[96px] text-right">
            <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">Total Fare</p>
            <p className="text-2xl font-black text-[var(--color-primary)]">₹{ride.fare.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* ── Google Maps link ── */}
        {(ride.from || ride.to) && (() => {
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ride.from)}&destination=${encodeURIComponent(ride.to)}`;
          return (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 hover:bg-[var(--color-border)]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <IconMapPin size={15} className="text-[var(--color-primary)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{ride.from}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] truncate">→ {ride.to}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-[var(--color-primary)]">
                <Navigation size={13} />
                Maps
              </div>
            </a>
          );
        })()}

        {/* ── Balance Due ── */}
        {hasBalanceDue && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] overflow-hidden">
            {/* Balance header row */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <IconCreditCard size={17} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">Balance Due</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                    ₹{ride.paidAmount.toLocaleString("en-IN")} advance paid
                  </p>
                </div>
              </div>
              <p className="text-2xl font-black text-[var(--color-text-primary)]">
                ₹{balanceAmount.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 border-t border-[var(--color-border)]">
              <button
                onClick={handlePayNow}
                className="flex items-center justify-center gap-2 py-3.5 bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <IconCreditCard size={14} />
                Pay Online
              </button>
              {ride.driver && (
                <button
                  onClick={() => setPayToDriverOpen(true)}
                  className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/40 transition-colors border-l border-[var(--color-border)]"
                >
                  <IconCar size={14} />
                  Pay to Driver
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── End Trip ── */}
        {!hasBalanceDue && (
          <button
            onClick={doEndTrip}
            disabled={endingTrip}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-danger)] py-4 text-sm font-bold text-white hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {endingTrip ? (
              <><IconLoader size={15} className="animate-spin" /> Ending trip…</>
            ) : (
              <>End Trip & Rate Driver</>
            )}
          </button>
        )}
      </div>

      {payToDriverOpen && (
        <PayToDriverModal
          tx={balanceTx}
          amountDue={balanceAmount}
          isBalance
          onClose={() => setPayToDriverOpen(false)}
        />
      )}
    </div>
  );
}

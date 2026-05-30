"use client";

import { useState } from "react";
import { Card, Avatar, Separator } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import {
  IconCar,
  IconMapPin,
  IconArrowRight,
  IconStar,
  IconPhone,
  IconLoader,
  IconCreditCard,
} from "@/constants/icons";
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

  // Balance due when some amount was paid online but it's less than the total fare.
  // After paying via Razorpay or driver cash, ["rides"] invalidates and this re-evaluates.
  const hasBalanceDue = ride.paidAmount > 0 && ride.fare > ride.paidAmount;
  const balanceAmount = hasBalanceDue ? Math.max(0, ride.fare - ride.paidAmount) : 0;

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
      amount: balanceAmount,
      mode: "balance",
      userName: session?.user?.name ?? "",
      userPhone: (session?.user as any)?.phoneNumber ?? "",
    });
  };

  // Construct a minimal UserTransaction for PayToDriverModal
  const balanceTx: UserTransaction = {
    id: ride.paymentId ?? ride.id,
    bookingId: ride.id,
    rzpOrderId: "",
    rzpPaymentId: null,
    amount: String(ride.paidAmount),
    currency: "INR",
    status: "paid",
    mode: "partial",
    paymentMethod: "online",
    paidAt: null,
    cashVerifiedAt: null,
    adminVerifiedBy: null,
    adminVerifiedAt: null,
    createdAt: "",
    bookingRef: ride.bookingRef,
    journeyDate: ride.journeyDate,
    journeyTime: ride.journeyTime,
    totalFare: String(ride.fare),
    bookingStatus: "ongoing",
    driverId: ride.driver ? "assigned" : null,
    pickupName: ride.from,
    dropName: ride.to,
  };

  return (
    <Card className="overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between bg-primary px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <p className="text-[13px] font-bold text-white">Ride in Progress</p>
        </div>
        <p className="text-[11px] text-white/70">#{ride.bookingRef}</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Route */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2.5">
          <IconMapPin size={13} className="shrink-0 text-primary" />
          <span className="flex-1 truncate text-sm font-semibold text-text-primary">{ride.from}</span>
          <IconArrowRight size={12} className="shrink-0 text-text-tertiary" />
          <span className="flex-1 truncate text-sm font-semibold text-text-primary text-right">{ride.to}</span>
        </div>

        {/* Driver info */}
        {ride.driver ? (
          <>
            <Separator />
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <Avatar.Fallback className="text-xs bg-primary text-white">
                  {ride.driver.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </Avatar.Fallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{ride.driver}</p>
                <p className="text-xs text-text-tertiary">{ride.driverPhone || "Driver"}</p>
              </div>
              <div className="flex items-center gap-2">
                {ride.driverPhone && (
                  <a
                    href={`tel:${ride.driverPhone}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <IconPhone size={14} />
                  </a>
                )}
                <p className="text-lg font-black text-primary shrink-0">
                  ₹{ride.fare.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-tertiary">Fare</p>
            <p className="text-lg font-black text-primary">₹{ride.fare.toLocaleString("en-IN")}</p>
          </div>
        )}

        <Separator />

        {/* ── Balance due section ── */}
        {hasBalanceDue && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 space-y-3">
            {/* Breakdown */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Balance Due</p>
                <p className="text-xs text-default-500 mt-0.5">
                  Advance ₹{ride.paidAmount.toLocaleString("en-IN")} paid ·{" "}
                  Balance <span className="font-bold text-warning">₹{balanceAmount.toLocaleString("en-IN")}</span>
                </p>
              </div>
              <p className="text-xl font-black text-warning shrink-0">
                ₹{balanceAmount.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Pay Now + Pay to Driver */}
            <div className="flex gap-2">
              <button
                onClick={handlePayNow}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <IconCreditCard size={14} />
                Pay ₹{balanceAmount.toLocaleString("en-IN")}
              </button>
              {ride.driver && (
                <button
                  onClick={() => setPayToDriverOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-default-600 hover:bg-default-50 transition-colors"
                >
                  <IconCar size={14} />
                  Pay to Driver
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── End trip button (only shown when no balance is due) ── */}
        {!hasBalanceDue && (
          <Button
            variant="primary"
            fullWidth
            onPress={doEndTrip}
            isDisabled={endingTrip}
            className="rounded-xl font-bold"
          >
            {endingTrip ? (
              <><IconLoader size={14} className="animate-spin" /> Ending trip…</>
            ) : (
              <><IconStar size={14} /> End Trip & Rate Driver</>
            )}
          </Button>
        )}
      </div>

      {/* Pay to Driver modal */}
      {payToDriverOpen && (
        <PayToDriverModal
          tx={balanceTx}
          amountDue={balanceAmount}
          isBalance
          onClose={() => setPayToDriverOpen(false)}
        />
      )}
    </Card>
  );
}

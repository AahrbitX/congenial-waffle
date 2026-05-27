"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Chip } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { useMyTransactions, useRazorpayPayment } from "@/hooks/useTransactions";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/constants/routes";
import {
  IconCar,
  IconLoader,
  IconChevronRight,
  IconReceipt,
  IconCheckCircle,
  IconXCircle,
  IconClockAlert,
  IconArrowLeftRight,
  IconCreditCard,
} from "@/constants/icons";
import { PayToDriverModal } from "./PayToDriverModal";
import type { UserTransaction, PaymentStatus } from "@/types/transactions.types";

// ── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
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

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: "success" | "warning" | "danger" | "default" | "accent"; icon: React.ReactNode }
> = {
  paid:           { label: "Paid",            color: "success",  icon: <IconCheckCircle    size={13} /> },
  created:        { label: "Pending",         color: "warning",  icon: <IconClockAlert     size={13} /> },
  cash_pending:   { label: "Awaiting Code",   color: "warning",  icon: <IconClockAlert     size={13} /> },
  cash_collected: { label: "Cash Confirmed",  color: "accent",   icon: <IconCheckCircle    size={13} /> },
  failed:         { label: "Failed",          color: "danger",   icon: <IconXCircle        size={13} /> },
  refunded:       { label: "Refunded",        color: "default",  icon: <IconArrowLeftRight size={13} /> },
};

// ── sub-components ──────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
        <IconReceipt size={24} className="text-text-tertiary" />
      </div>
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}

/** A clickable transaction row for the history section (no action buttons) */
function HistoryRow({ tx }: { tx: UserTransaction }) {
  // created payments only appear in history when the booking is non-ongoing (abandoned/cancelled) — show as Failed
  const displayStatus = tx.status === "created" ? "failed" : tx.status;
  const { label, color, icon } = STATUS_CONFIG[displayStatus] ?? STATUS_CONFIG.failed;

  return (
    <Link
      href={ROUTES.dashboard.transaction(tx.id)}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface-muted p-4 transition-all hover:border-primary hover:bg-surface"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface border border-border text-text-secondary">
        <IconCar size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {tx.pickupName} → {tx.dropName}
        </p>
        <p className="text-xs text-text-secondary">
          {tx.bookingRef} · {formatDate(tx.journeyDate)} {formatTime(tx.journeyTime)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <p className="text-sm font-bold text-text-primary">
          ₹{parseFloat(tx.amount).toLocaleString("en-IN")}
        </p>
        <Chip color={color} variant="soft" size="sm" className="text-[10px] font-semibold">
          <span className="flex items-center gap-1">{icon}{label}</span>
        </Chip>
      </div>
      <IconChevronRight size={14} className="shrink-0 text-text-tertiary" />
    </Link>
  );
}

/** A pending payment row with Pay Now / Pay to Driver action buttons */
function PendingRow({
  tx,
  amountDue,
  label,
  isBalance,
  onPayNow,
  onPayToDriver,
}: {
  tx: UserTransaction;
  amountDue: number;
  label: string;
  isBalance?: boolean;
  onPayNow: () => void;
  onPayToDriver: () => void;
}) {
  const statusCfg = isBalance
    ? STATUS_CONFIG.created
    : (STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.created);

  return (
    <div className={`rounded-2xl border bg-surface-muted p-4 space-y-3 ${isBalance ? "border-dashed border-warning ml-4" : "border-border"}`}>
      {/* Top row */}
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface border border-border text-text-secondary">
          <IconCar size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">{label}</p>
          <p className="text-xs text-text-secondary">
            {tx.bookingRef} · {formatDate(tx.journeyDate)} {formatTime(tx.journeyTime)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="text-sm font-bold text-text-primary">
            ₹{amountDue.toLocaleString("en-IN")}
          </p>
          <Chip color={statusCfg.color} variant="soft" size="sm" className="text-[10px] font-semibold">
            <span className="flex items-center gap-1">{statusCfg.icon}{isBalance ? "Balance Due" : statusCfg.label}</span>
          </Chip>
        </div>
      </div>

      {/* Action buttons (hide if already awaiting code verification) */}
      {tx.status !== "cash_pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            className="flex-1 rounded-xl font-semibold text-xs"
            onPress={onPayNow}
          >
            <IconCreditCard size={13} />
            Pay Now
          </Button>
          {/* Only show Pay to Driver when a driver is assigned and the ride is ongoing */}
          {tx.driverId && tx.bookingStatus === "ongoing" && (
            <Button
              size="sm"
              variant="outline"
              onPress={onPayToDriver}
              className="flex-1 rounded-xl font-semibold text-xs"
            >
              <IconCar size={13} />
              Pay to Driver
            </Button>
          )}
        </div>
      )}

      {/* Awaiting code state */}
      {tx.status === "cash_pending" && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-warning font-medium">Waiting for driver code</p>
          <Button size="sm" variant="outline" onPress={onPayToDriver} className="rounded-xl text-xs">
            Enter Code
          </Button>
        </div>
      )}
    </div>
  );
}

// ── main component ──────────────────────────────────────────────────────────

export function TransactionsTab() {
  const { data: transactions = [], isLoading } = useMyTransactions();
  const { data: session } = authClient.useSession();
  const { pay } = useRazorpayPayment();
  const [modalTx, setModalTx] = useState<{ tx: UserTransaction; amountDue?: number; isBalance?: boolean } | null>(null);

  // Load Razorpay checkout.js
  useEffect(() => {
    if (document.querySelector('script[src*="razorpay"]')) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(s);
  }, []);

  function handlePayNow(tx: UserTransaction, amountDue: number, mode: "full" | "partial" | "balance") {
    pay({
      bookingId: tx.bookingId,
      amount: amountDue,
      mode,
      userName: session?.user?.name ?? "",
      userPhone: (session?.user as any)?.phoneNumber ?? "",
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconLoader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  // Bookings that already have a successful payment — exclude these from "created" pending
  const bookingsAlreadyPaid = new Set(
    transactions
      .filter((t) => t.status === "paid" || t.status === "cash_collected")
      .map((t) => t.bookingId),
  );

  // Pending: unpaid online (created) + cash awaiting code (cash_pending)
  // Only surface for ongoing rides — abandoned/dismissed Razorpay orders for non-ongoing bookings are hidden
  const pendingOnline  = transactions.filter(
    (t) => t.status === "created" && !bookingsAlreadyPaid.has(t.bookingId) && t.bookingStatus === "ongoing",
  );
  const pendingCash    = transactions.filter((t) => t.status === "cash_pending" && !bookingsAlreadyPaid.has(t.bookingId) && t.bookingStatus === "ongoing");
  const pendingItems   = [...pendingOnline, ...pendingCash];

  // Sum all paid amounts per booking (covers both partial + balance payments)
  const totalPaidByBooking = new Map<string, number>();
  transactions.forEach((t) => {
    if (t.status === "paid" || t.status === "cash_collected") {
      totalPaidByBooking.set(
        t.bookingId,
        (totalPaidByBooking.get(t.bookingId) ?? 0) + parseFloat(t.amount),
      );
    }
  });

  // Balance due: partial advance paid, but total paid across all records < totalFare
  // Exclude cancelled bookings — balance is cleared when a booking is cancelled
  const balanceDues = transactions.filter(
    (t) =>
      t.status === "paid" &&
      t.mode === "partial" &&
      t.bookingStatus !== "cancelled" &&
      (totalPaidByBooking.get(t.bookingId) ?? 0) < parseFloat(t.totalFare) - 0.01,
  );

  const totalPendingCount = pendingItems.length + balanceDues.length;

  // History: paid, cash_collected, refunded, failed + abandoned attempts (created for non-ongoing bookings)
  const history = transactions.filter(
    (t) =>
      t.status === "paid" ||
      t.status === "cash_collected" ||
      t.status === "refunded" ||
      t.status === "failed" ||
      (t.status === "created" && t.bookingStatus !== "ongoing"),
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Your ride payment history and pending dues
        </p>
      </div>

      {/* Pending Payments */}
      <Card className="rounded-3xl border border-border bg-surface shadow-sm">
        <Card.Header className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
          <div>
            <Card.Title className="text-base font-semibold">Pending Payments</Card.Title>
            <p className="text-sm text-text-secondary">Rides awaiting payment</p>
          </div>
          {totalPendingCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning text-white text-xs font-bold">
              {totalPendingCount}
            </span>
          )}
        </Card.Header>
        <Card.Content className="flex flex-col gap-3 p-5">
          {totalPendingCount === 0 ? (
            <EmptyState message="No pending payments — you're all clear!" />
          ) : (
            <>
              {pendingItems.map((tx) => (
                <PendingRow
                  key={tx.id}
                  tx={tx}
                  amountDue={parseFloat(tx.amount)}
                  label={`${tx.pickupName} → ${tx.dropName}`}
                  onPayNow={() => handlePayNow(tx, parseFloat(tx.amount), tx.mode as "full" | "partial")}
                  onPayToDriver={() => setModalTx({ tx })}
                />
              ))}

              {balanceDues.map((tx) => {
                const remaining = parseFloat(tx.totalFare) - parseFloat(tx.amount);
                return (
                  <div key={`balance-${tx.id}`} className="space-y-1">
                    {/* Paid advance row */}
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface border border-border text-text-secondary">
                        <IconCar size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-text-primary">
                          {tx.pickupName} → {tx.dropName} (Advance)
                        </p>
                        <p className="text-[11px] text-text-tertiary">{tx.bookingRef}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">
                          ₹{parseFloat(tx.amount).toLocaleString("en-IN")}
                        </span>
                        <Chip color="success" variant="soft" size="sm" className="text-[10px]">Paid</Chip>
                      </div>
                    </div>
                    {/* Balance due row */}
                    <PendingRow
                      tx={tx}
                      amountDue={remaining}
                      label={`Balance Due — ${tx.pickupName} → ${tx.dropName}`}
                      isBalance
                      onPayNow={() => handlePayNow(tx, remaining, "balance")}
                      onPayToDriver={() => setModalTx({ tx, amountDue: remaining, isBalance: true })}
                    />
                  </div>
                );
              })}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Payment History */}
      <Card className="rounded-3xl border border-border bg-surface shadow-sm">
        <Card.Header className="border-b border-border px-5 py-4">
          <Card.Title className="text-base font-semibold">Payment History</Card.Title>
          <p className="text-sm text-text-secondary">Completed, refunded, and cash-confirmed transactions</p>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3 p-5">
          {history.length === 0 ? (
            <EmptyState message="No transaction history yet." />
          ) : (
            history.map((tx) => <HistoryRow key={tx.id} tx={tx} />)
          )}
        </Card.Content>
      </Card>

      {/* Pay to Driver modal */}
      {modalTx && (
        <PayToDriverModal
          tx={modalTx.tx}
          amountDue={modalTx.amountDue}
          isBalance={modalTx.isBalance}
          onClose={() => setModalTx(null)}
        />
      )}
    </div>
  );
}

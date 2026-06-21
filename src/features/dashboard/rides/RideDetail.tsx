"use client";

import Link from "next/link";
import { useDashboard } from "@/context/DashboardContext";
import { useRide } from "@/hooks/useRides";
import { initials } from "@/lib/dashboard/helpers";
import {
  IconStar,
  IconLoader,
  IconCar,
  IconX,
  IconCheckCircle,
  IconCircle,
  IconReceipt,
  IconCreditCard,
  IconPhone,
  IconShield,
} from "@/constants/icons";

import { ROUTES } from "@/constants/routes";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@heroui/react";

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    className: "border-[var(--color-success)]/40 bg-[var(--color-success)]/8 text-[var(--color-success)]",
    icon: <Check size={12} strokeWidth={3} />,
  },
  ongoing: {
    label: "In Progress",
    className: "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/8 text-[var(--color-primary)]",
    icon: <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse inline-block" />,
  },
  confirmed: {
    label: "Driver Assigned",
    className: "border-[var(--color-success)]/40 bg-[var(--color-success)]/8 text-[var(--color-success)]",
    icon: <Check size={12} strokeWidth={3} />,
  },
  pending: {
    label: "Awaiting Driver",
    className: "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/8 text-[var(--color-warning)]",
    icon: <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] animate-pulse inline-block" />,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/8 text-[var(--color-danger)]",
    icon: <IconX size={12} />,
  },
} as const;

// ─── Timeline steps ───────────────────────────────────────────────────────────

const STEPS = [
  { key: "pending",   label: "Booking Placed",  sub: "Your ride is queued"  },
  { key: "confirmed", label: "Driver Assigned",  sub: "Driver is on the way" },
  { key: "ongoing",   label: "Trip Started",     sub: "You're on the move"   },
  { key: "completed", label: "Trip Completed",   sub: "Safe travels!"        },
] as const;

const STEP_ORDER: Record<string, number> = {
  pending: 0, confirmed: 1, ongoing: 2, completed: 3, cancelled: -1,
};

// ─── Payment labels ───────────────────────────────────────────────────────────

const PAY_LABEL: Record<string, { text: string; color: string }> = {
  paid:           { text: "Paid",           color: "text-[var(--color-success)]" },
  cash_collected: { text: "Cash Collected", color: "text-[var(--color-success)]" },
  cash_pending:   { text: "Cash Pending",   color: "text-[var(--color-warning)]" },
  created:        { text: "Pending",        color: "text-[var(--color-warning)]" },
  refunded:       { text: "Refunded",       color: "text-[var(--color-primary)]" },
  failed:         { text: "Failed",         color: "text-[var(--color-danger)]"  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtTime(t: string) {
  if (!t) return "—";
  const [h, min] = t.split(":").map(Number);
  const d = new Date(); d.setHours(h, min);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RideDetail({ id }: { id: string }) {
  const { data: ride, isLoading } = useRide(id);
  const { openRatingModal } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader size={28} className="animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-muted)] flex items-center justify-center">
          <IconCar size={26} className="text-[var(--color-text-tertiary)]" />
        </div>
        <div>
          <p className="text-base font-bold">Ride not found</p>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">This booking may have been removed.</p>
        </div>
        <Link href={ROUTES.dashboard.rides}
          className="text-sm text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-1">
          <ChevronLeft size={14} /> Back to rides
        </Link>
      </div>
    );
  }

  const cfg         = STATUS_CONFIG[ride.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const hasDriver   = !!ride.driver && ride.driver !== "—";
  const currentStep = STEP_ORDER[ride.status] ?? 0;
  const isCancelled = ride.status === "cancelled";
  const showOtp     = ride.status === "confirmed" && !!ride.rideStartOtp;

  const paymentLabel = ride.paymentMethod
    ? ride.paymentMethod.charAt(0).toUpperCase() + ride.paymentMethod.slice(1)
    : "—";

  return (
    <div className="max-w-lg mx-auto pb-10 px-4">

      {/* ── Back link ── */}
      <div className="pt-4 pb-3">
        <Link href={ROUTES.dashboard.rides}
          className="inline-flex items-center gap-1 text-[var(--color-text-tertiary)] text-sm font-medium hover:text-[var(--color-text-primary)] transition-colors">
          <ChevronLeft size={14} /> Ride History
        </Link>
      </div>

      {/* ── Booking ref + status ── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-0.5">
            Booking Reference
          </p>
          <p className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
            #{ride.bookingRef}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 mt-1 ${cfg.className}`}>
          {cfg.icon}
          {cfg.label}
        </div>
      </div>

      <div className="space-y-3">

        {/* ── Route card ── */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-stretch gap-3">
            <div className="flex flex-col items-center py-1 shrink-0">
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
              <div className="w-px flex-1 bg-[var(--color-border)] my-1.5" />
              <div className="w-3 h-3 rounded-full bg-[var(--color-text-tertiary)]/40" />
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">From</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)] leading-snug">{ride.from}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">To</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)] leading-snug">{ride.to}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Date / Time / Payment ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Date",    value: fmtDate(ride.journeyDate) },
            { label: "Time",    value: fmtTime(ride.journeyTime) },
            { label: "Payment", value: paymentLabel },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
              <p className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Driver card ── */}
        {hasDriver && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">Your Driver</p>
            </div>
            <div className="flex items-center gap-3 px-4 pb-4 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <span className="text-[var(--color-primary)] font-black text-lg">{initials(ride.driver)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-[var(--color-text-primary)] leading-tight">{ride.driver}</p>
                {(ride.vehicle || ride.plate) && (
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                    {ride.vehicle}{ride.vehicle && ride.plate ? " · " : ""}{ride.plate}
                  </p>
                )}
              </div>
              {ride.driverPhone && (
                <a href={`tel:${ride.driverPhone}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors shrink-0">
                  <IconPhone size={14} className="text-[var(--color-primary)]" />
                  Call
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Ride Start OTP ── */}
        {showOtp && (
          <div className="rounded-2xl border-2 border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 overflow-hidden">
            <div className="px-4 pt-3 pb-1 flex items-center gap-2">
              <IconShield size={12} className="text-[var(--color-primary)]" />
              <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Ride Start OTP</p>
            </div>
            <div className="px-4 pb-4 pt-2 flex items-center justify-between">
              <div className="flex gap-2">
                {ride.rideStartOtp!.split("").map((d, i) => (
                  <div key={i}
                    className="w-12 h-14 rounded-xl border-2 border-[var(--color-primary)]/30 bg-[var(--color-surface)] flex items-center justify-center text-2xl font-black text-[var(--color-primary)]">
                    {d}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)] text-right leading-relaxed max-w-[100px]">
                Share with driver on arrival
              </p>
            </div>
          </div>
        )}

        {/* ── Cancelled notice ── */}
        {isCancelled && (
          <div className="rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-danger)]/10 flex items-center justify-center shrink-0">
              <IconX size={16} className="text-[var(--color-danger)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-danger)]">Ride Cancelled</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">This booking was cancelled.</p>
            </div>
          </div>
        )}

        {/* ── Journey Progress ── */}
        {!isCancelled && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="bg-[var(--color-surface-muted)] px-4 py-2.5 border-b border-[var(--color-border)]">
              <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">Journey Progress</p>
            </div>
            <div className="p-4 space-y-0">
              {STEPS.map((step, i) => {
                const isDone   = currentStep > i;
                const isActive = currentStep === i;
                const isLast   = i === STEPS.length - 1;
                const ts       = ride.timelineAt?.[step.key as keyof NonNullable<typeof ride.timelineAt>] ?? null;

                return (
                  <div key={step.key} className="flex items-start gap-3.5">
                    <div className="flex flex-col items-center shrink-0 pt-0.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isDone   ? "bg-[var(--color-success)] text-white"
                        : isActive ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary)]/20"
                        : "bg-[var(--color-surface-muted)] text-[var(--color-text-tertiary)]"
                      }`}>
                        {isDone   ? <IconCheckCircle size={14} />
                        : isActive ? <span className="w-2.5 h-2.5 rounded-full bg-white" />
                        : <IconCircle size={12} />}
                      </div>
                      {!isLast && (
                        <div className={`w-px flex-1 min-h-[28px] mt-1 mb-1 ${
                          isDone ? "bg-[var(--color-success)]/40" : "bg-[var(--color-border)]"
                        }`} />
                      )}
                    </div>
                    <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight ${
                          isDone || isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
                        }`}>
                          {step.label}
                        </p>
                        {(isDone || isActive) && ts && (
                          <p className="text-[10px] text-[var(--color-text-tertiary)] shrink-0">{fmtDateTime(ts)}</p>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${
                        isDone || isActive ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-tertiary)]/40"
                      }`}>
                        {step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Fare ── */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="bg-[var(--color-surface-muted)] px-4 py-2.5 border-b border-[var(--color-border)] flex items-center gap-2">
            <IconReceipt size={13} className="text-[var(--color-text-tertiary)]" />
            <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">Fare Breakdown</p>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Base fare</span>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                ₹{Math.max(0, ride.fare - ride.tip).toLocaleString("en-IN")}
              </span>
            </div>
            {ride.tip > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Tip</span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  ₹{ride.tip.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="border-t border-[var(--color-border)] pt-2.5 flex items-center justify-between">
              <span className="text-base font-black text-[var(--color-text-primary)]">Total</span>
              <span className="text-base font-black text-[var(--color-primary)]">
                ₹{ride.fare.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* ── Transactions ── */}
        {(ride.transactions?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="bg-[var(--color-surface-muted)] px-4 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCreditCard size={13} className="text-[var(--color-text-tertiary)]" />
                <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">Transactions</p>
              </div>
              {ride.transactions!.length > 1 && (
                <span className="text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold px-2 py-0.5 rounded-full">
                  {ride.transactions!.length} attempts
                </span>
              )}
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {ride.transactions!.map((txn, idx) => {
                const payLabel = PAY_LABEL[txn.status] ?? PAY_LABEL.created;
                return (
                  <div key={txn.id} className="p-4 space-y-2">
                    {ride.transactions!.length > 1 && (
                      <p className="text-xs font-bold text-[var(--color-text-tertiary)]">
                        Attempt {ride.transactions!.length - idx}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">Amount</span>
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">
                        ₹{parseFloat(txn.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">Status</span>
                      <span className={`text-sm font-semibold ${payLabel.color}`}>{payLabel.text}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">Method</span>
                      <span className="text-sm text-[var(--color-text-primary)] capitalize">{txn.method || "—"}</span>
                    </div>
                    {txn.paidAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-secondary)]">Paid At</span>
                        <span className="text-sm text-[var(--color-text-primary)]">{fmtDateTime(txn.paidAt)}</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-[var(--color-text-secondary)] shrink-0">Txn ID</span>
                      <span className="text-xs font-mono text-right text-[var(--color-text-primary)] break-all">{txn.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Rating ── */}
        {ride.status === "completed" && (
          ride.rating > 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-2">Your Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <IconStar key={s} size={18}
                      className={s <= ride.rating
                        ? "text-[var(--color-warning)] fill-[var(--color-warning)]"
                        : "text-[var(--color-border)] fill-[var(--color-border)]"} />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-[var(--color-text-primary)]">{ride.rating}/5</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onPress={() => openRatingModal(ride)}>Edit</Button>
            </div>
          ) : (
            <Button className="w-full" onPress={() => openRatingModal(ride)}>
              <IconStar size={16} />
              Rate this Ride
            </Button>
          )
        )}

      </div>
    </div>
  );
}

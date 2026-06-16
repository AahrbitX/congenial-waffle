"use client";

import Link from "next/link";
import { useDashboard } from "@/context/DashboardContext";
import { useRide } from "@/hooks/useRides";
import { initials } from "@/lib/dashboard/helpers";
import {
  IconMapPin,
  IconStar,
  IconLoader,
  IconCar,
  IconX,
  IconCheckCircle,
  IconCircle,
  IconReceipt,
  IconCreditCard,
  IconPhone,
} from "@/constants/icons";

import { ROUTES } from "@/constants/routes";
import { ChevronLeft, Navigation } from "lucide-react";
import { Button } from "@heroui/react";

// ─── Status theming ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  completed: {
    gradient: "from-emerald-600 to-emerald-500",
    badge:    "bg-white/20 text-white",
    dot:      "bg-emerald-200",
    label:    "Completed",
    icon:     "✓",
  },
  ongoing: {
    gradient: "from-primary to-primary/80",
    badge:    "bg-white/20 text-white",
    dot:      "bg-yellow-300 animate-pulse",
    label:    "In Progress",
    icon:     "◉",
  },
  confirmed: {
    gradient: "from-primary to-primary/80",
    badge:    "bg-white/20 text-white",
    dot:      "bg-white",
    label:    "Driver Assigned",
    icon:     "◉",
  },
  pending: {
    gradient: "from-amber-500 to-orange-500",
    badge:    "bg-white/20 text-white",
    dot:      "bg-white",
    label:    "Pending",
    icon:     "○",
  },
  cancelled: {
    gradient: "from-rose-600 to-rose-500",
    badge:    "bg-white/20 text-white",
    dot:      "bg-white",
    label:    "Cancelled",
    icon:     "✕",
  },
} as const;

// ─── Timeline ─────────────────────────────────────────────────────────────────

const STEPS = [
  { key: "pending",   label: "Booking Placed",  sub: "Your ride is queued"       },
  { key: "confirmed", label: "Driver Assigned",  sub: "Driver is on the way"      },
  { key: "ongoing",   label: "Trip Started",     sub: "You're on the move"        },
  { key: "completed", label: "Trip Completed",   sub: "Safe travels!"             },
] as const;

const STEP_ORDER: Record<string, number> = {
  pending: 0, confirmed: 1, ongoing: 2, completed: 3, cancelled: -1,
};

// ─── Payment labels ───────────────────────────────────────────────────────────

const PAY_LABEL: Record<string, { text: string; color: string }> = {
  paid:           { text: "Paid",           color: "text-emerald-600" },
  cash_collected: { text: "Cash Collected", color: "text-emerald-600" },
  cash_pending:   { text: "Cash Pending",   color: "text-amber-600"   },
  created:        { text: "Pending",        color: "text-amber-600"   },
  refunded:       { text: "Refunded",       color: "text-primary"     },
  failed:         { text: "Failed",         color: "text-rose-600"    },
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
        <IconLoader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-default-100 flex items-center justify-center">
          <IconCar size={26} className="text-muted" />
        </div>
        <div>
          <p className="text-base font-bold">Ride not found</p>
          <p className="text-sm text-muted mt-1">This booking may have been removed.</p>
        </div>
        <Link href={ROUTES.dashboard.rides}
          className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
          <ChevronLeft size={14} /> Back to rides
        </Link>
      </div>
    );
  }

  const cfg         = STATUS_CONFIG[ride.status] ?? STATUS_CONFIG.pending;
  const hasDriver   = !!ride.driver && ride.driver !== "—";
  const currentStep = STEP_ORDER[ride.status] ?? 0;
  const isCancelled = ride.status === "cancelled";

  return (
    <div className="max-w-lg mx-auto pb-10">

      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-br ${cfg.gradient} px-5 pt-4 pb-8`}>
        <Link href={ROUTES.dashboard.rides}
          className="inline-flex items-center gap-1 text-white/70 text-sm font-medium mb-5 hover:text-white transition-colors">
          <ChevronLeft size={14} /> Ride History
        </Link>

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/60 text-xs font-medium mb-0.5">Booking Reference</p>
            <p className="text-white font-black text-lg tracking-tight">#{ride.bookingRef}</p>
          </div>
          <span className={`${cfg.badge} flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Route pill */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
              <div className="w-px h-7 bg-white/30" />
              <IconMapPin size={11} className="text-white/90" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="text-white/50 text-[9px] font-bold tracking-widest uppercase">From</p>
                <p className="text-white text-sm font-semibold truncate leading-tight">{ride.from}</p>
              </div>
              <div>
                <p className="text-white/50 text-[9px] font-bold tracking-widest uppercase">To</p>
                <p className="text-white text-sm font-semibold truncate leading-tight">{ride.to}</p>
              </div>
            </div>
            <Navigation size={16} className="text-white/40 shrink-0" />
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="px-4 -mt-4 space-y-3">

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Date",     value: fmtDate(ride.journeyDate) },
            { label: "Time",     value: fmtTime(ride.journeyTime) },
            { label: "Payment",  value: ride.paymentMethod ? (ride.paymentMethod.charAt(0).toUpperCase() + ride.paymentMethod.slice(1)) : "—" },
          ].map(({ label, value }) => (
            <div key={label}
              className="bg-background border border-border rounded-2xl px-3 py-3 text-center shadow-sm">
              <p className="text-[10px] text-muted font-semibold uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm font-bold text-foreground leading-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Cancelled Notice ── */}
        {isCancelled && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0">
              <IconX size={16} className="text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Ride Cancelled</p>
              <p className="text-xs text-rose-500 dark:text-rose-500 mt-0.5">This booking was cancelled.</p>
            </div>
          </div>
        )}

        {/* ── Driver Card ── */}
        {hasDriver && (
          <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-surface-muted px-4 py-2.5 border-b border-border">
              <p className="text-[10px] font-bold tracking-widest text-muted uppercase">Your Driver</p>
            </div>
            <div className="p-4 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-black text-lg">{initials(ride.driver)}</span>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-base leading-tight truncate">{ride.driver}</p>
                {(ride.vehicle || ride.plate) && (
                  <p className="text-sm text-muted mt-0.5 truncate">
                    {ride.vehicle}{ride.vehicle && ride.plate ? " · " : ""}{ride.plate}
                  </p>
                )}
              </div>
              {/* Call button */}
              {ride.driverPhone && (
                <a href={`tel:${ride.driverPhone}`}
                  className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-md hover:bg-primary/90 transition-colors">
                  <IconPhone size={17} className="text-white" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Journey Progress (Timeline) ── */}
        {!isCancelled && (
          <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-surface-muted px-4 py-2.5 border-b border-border">
              <p className="text-[10px] font-bold tracking-widest text-muted uppercase">Journey Progress</p>
            </div>
            <div className="p-4 space-y-0">
              {STEPS.map((step, i) => {
                const isDone   = currentStep > i;
                const isActive = currentStep === i;
                const isLast   = i === STEPS.length - 1;
                const ts       = ride.timelineAt?.[step.key as keyof NonNullable<typeof ride.timelineAt>] ?? null;

                return (
                  <div key={step.key} className="flex items-start gap-3.5">
                    {/* Dot + connector */}
                    <div className="flex flex-col items-center shrink-0 pt-0.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isActive
                            ? "bg-primary text-white ring-4 ring-primary/20"
                            : "bg-default-100 text-default-400"
                      }`}>
                        {isDone ? (
                          <IconCheckCircle size={14} />
                        ) : isActive ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-white" />
                        ) : (
                          <IconCircle size={12} />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-px flex-1 min-h-[28px] mt-1 mb-1 ${
                          isDone ? "bg-emerald-300" : "bg-default-200"
                        }`} />
                      )}
                    </div>

                    {/* Label */}
                    <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight ${
                          isDone || isActive ? "text-foreground" : "text-muted"
                        }`}>
                          {step.label}
                        </p>
                        {(isDone || isActive) && ts && (
                          <p className="text-[10px] text-muted shrink-0">{fmtDateTime(ts)}</p>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${isDone || isActive ? "text-muted" : "text-default-300"}`}>
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
        <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-surface-muted px-4 py-2.5 border-b border-border flex items-center gap-2">
            <IconReceipt size={13} className="text-muted" />
            <p className="text-[10px] font-bold tracking-widest text-muted uppercase">Fare Breakdown</p>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Base fare</span>
              <span className="text-sm font-semibold text-foreground">
                ₹{Math.max(0, ride.fare - ride.tip).toLocaleString("en-IN")}
              </span>
            </div>
            {ride.tip > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Tip</span>
                <span className="text-sm font-semibold text-foreground">
                  ₹{ride.tip.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-2.5 flex items-center justify-between">
              <span className="text-base font-black text-foreground">Total</span>
              <span className="text-base font-black text-primary">
                ₹{ride.fare.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* ── Transactions ── */}
        {(ride.transactions?.length ?? 0) > 0 && (
          <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-surface-muted px-4 py-2.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCreditCard size={13} className="text-muted" />
                <p className="text-[10px] font-bold tracking-widest text-muted uppercase">Transactions</p>
              </div>
              {(ride.transactions!.length > 1) && (
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  {ride.transactions!.length} attempts
                </span>
              )}
            </div>
            <div className="divide-y divide-border">
              {ride.transactions!.map((txn, idx) => {
                const payLabel = PAY_LABEL[txn.status] ?? PAY_LABEL.created;
                return (
                  <div key={txn.id} className="p-4 space-y-2">
                    {ride.transactions!.length > 1 && (
                      <p className="text-xs font-bold text-muted">
                        Attempt {ride.transactions!.length - idx}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Amount</span>
                      <span className="text-sm font-bold text-foreground">
                        ₹{parseFloat(txn.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Status</span>
                      <span className={`text-sm font-semibold ${payLabel.color}`}>{payLabel.text}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Method</span>
                      <span className="text-sm text-foreground capitalize">{txn.method || "—"}</span>
                    </div>
                    {txn.paidAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Paid At</span>
                        <span className="text-sm text-foreground">{fmtDateTime(txn.paidAt)}</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-muted shrink-0">Txn ID</span>
                      <span className="text-xs font-mono text-right text-foreground break-all">{txn.id}</span>
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
            <div className="bg-background border border-border rounded-2xl shadow-sm p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted uppercase mb-2">Your Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <IconStar key={s} size={18}
                      className={s <= ride.rating ? "text-amber-400 fill-amber-400" : "text-default-200 fill-default-200"} />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-foreground">{ride.rating}/5</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onPress={() => openRatingModal(ride)}>
                Edit
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onPress={() => openRatingModal(ride)}
            >
              <IconStar size={16} />
              Rate this Ride
            </Button>
          )
        )}

      </div>
    </div>
  );
}

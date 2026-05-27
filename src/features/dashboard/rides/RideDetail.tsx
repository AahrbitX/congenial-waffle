"use client";

import Link from "next/link";
import { useDashboard } from "@/context/DashboardContext";
import { useRide } from "@/hooks/useRides";
import { initials } from "@/lib/dashboard/helpers";
import {
  IconMapPin,
  IconPhone,
  IconStar,
  IconLoader,
  IconCar,
  IconCalendar,
  IconClock,
  IconX,
  IconTicket,
  IconCheckCircle,
  IconCircle,
  IconReceipt,
  IconCreditCard,
} from "@/constants/icons";
import { ROUTES } from "@/constants/routes";
import { ChevronLeft } from "lucide-react";

const STATUS_CONFIG = {
  completed: { bg: "bg-success",  text: "Completed",   dot: "bg-white" },
  ongoing:   { bg: "bg-primary",  text: "In Progress",  dot: "bg-yellow-300" },
  confirmed: { bg: "bg-primary",  text: "Confirmed",    dot: "bg-white" },
  pending:   { bg: "bg-warning",  text: "Pending",      dot: "bg-white" },
  cancelled: { bg: "bg-danger",   text: "Cancelled",    dot: "bg-white" },
} as const;

// Timeline steps in order
const TIMELINE_STEPS: { key: string; label: string }[] = [
  { key: "pending",   label: "Booking Placed" },
  { key: "confirmed", label: "Driver Assigned" },
  { key: "ongoing",   label: "Trip Started" },
  { key: "completed", label: "Trip Completed" },
];

const STATUS_ORDER: Record<string, number> = {
  pending:   0,
  confirmed: 1,
  ongoing:   2,
  completed: 3,
  cancelled: -1,
};

const PAYMENT_STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  paid:            { text: "Paid",           cls: "bg-success/10 text-success" },
  cash_collected:  { text: "Cash Collected", cls: "bg-success/10 text-success" },
  cash_pending:    { text: "Cash Pending",   cls: "bg-warning/10 text-warning" },
  created:         { text: "Failed",         cls: "bg-danger/10 text-danger" },
  refunded:        { text: "Refunded",       cls: "bg-primary/10 text-primary" },
  failed:          { text: "Failed",         cls: "bg-danger/10 text-danger" },
};

function formatDate(d: string) {
  if (!d) return "—";
  const [year, month, day] = d.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(t: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface RideDetailProps {
  id: string;
}

export function RideDetail({ id }: RideDetailProps) {
  const { data: ride, isLoading } = useRide(id);
  const { openRatingModal, openTicketModal } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <IconLoader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-default-100 flex items-center justify-center">
          <IconCar size={24} className="text-default-400" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">Ride not found</p>
          <p className="text-sm text-default-400 mt-1">This booking may have been removed.</p>
        </div>
        <Link
          href={ROUTES.dashboard.rides}
          className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <ChevronLeft size={15} /> Back to rides
        </Link>
      </div>
    );
  }

  const statusCfg   = STATUS_CONFIG[ride.status] ?? STATUS_CONFIG.pending;
  const hasDriver   = ride.driver && ride.driver !== "—" && ride.driver !== "";
  const currentStep = STATUS_ORDER[ride.status] ?? 0;
  const isCancelled = ride.status === "cancelled";

  return (
    <div className="max-w-lg mx-auto pb-8">

      {/* ── Hero Header ── */}
      <div className={`${statusCfg.bg} rounded-b-3xl px-5 pt-5 pb-6 mb-4`}>
        <Link
          href={ROUTES.dashboard.rides}
          className="inline-flex items-center gap-1 text-white/70 text-xs font-medium mb-4 hover:text-white transition-colors"
        >
          <ChevronLeft size={14} /> Ride History
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium mb-0.5">
              #{ride.bookingRef}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-white font-bold text-base leading-snug truncate max-w-[130px]">
                {ride.from}
              </span>
              <span className="text-white/60 text-sm shrink-0">→</span>
              <span className="text-white font-bold text-base leading-snug truncate max-w-[130px]">
                {ride.to}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.text}
          </span>
        </div>
      </div>

      <div className="px-4 space-y-3">

        {/* ── Status Timeline ── */}
        {!isCancelled && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
            <p className="text-[11px] text-default-400 font-semibold uppercase tracking-wide mb-4">Journey Progress</p>
            <div className="flex flex-col gap-0">
              {TIMELINE_STEPS.map((step, i) => {
                const stepIdx  = i;
                const isDone   = currentStep > stepIdx;
                const isActive = currentStep === stepIdx;
                const isLast   = i === TIMELINE_STEPS.length - 1;
                const tsKey    = step.key as keyof NonNullable<typeof ride.timelineAt>;
                const ts       = ride.timelineAt?.[tsKey] ?? null;
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    {/* dot + connector */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isDone
                            ? "bg-success text-white"
                            : isActive
                            ? "bg-primary text-white ring-4 ring-primary/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {isDone ? (
                          <IconCheckCircle size={14} />
                        ) : isActive ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-white" />
                        ) : (
                          <IconCircle size={12} />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`w-px flex-1 min-h-[28px] ${
                            isDone ? "bg-success/40" : "bg-zinc-200 dark:bg-zinc-700"
                          }`}
                        />
                      )}
                    </div>
                    {/* label + timestamp */}
                    <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isDone || isActive ? "text-foreground" : "text-default-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-default-400 mt-0.5">
                        {ts ? formatDateTime(ts) : (isDone || isActive ? "—" : "Pending")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Cancelled notice ── */}
        {isCancelled && (
          <div className="rounded-2xl border border-danger/20 bg-danger/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
              <IconX size={16} className="text-danger" />
            </div>
            <p className="text-sm text-danger font-medium">This ride was cancelled.</p>
          </div>
        )}

        {/* ── Route ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
          <p className="text-[11px] text-default-400 font-semibold uppercase tracking-wide mb-3">Route</p>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[10px] text-default-400 uppercase tracking-wide font-semibold">Pickup</p>
                <p className="text-sm font-semibold text-foreground">{ride.from}</p>
              </div>
              <div>
                <p className="text-[10px] text-default-400 uppercase tracking-wide font-semibold">Drop-off</p>
                <p className="text-sm font-semibold text-foreground">{ride.to}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Journey Details ── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <IconCalendar size={15} className="text-primary" />, label: "Date",    value: formatDate(ride.journeyDate) },
            { icon: <IconClock    size={15} className="text-primary" />, label: "Time",    value: formatTime(ride.journeyTime) },
            { icon: <IconCar      size={15} className="text-primary" />, label: "Vehicle", value: ride.vehicleType ? ride.vehicleType.charAt(0).toUpperCase() + ride.vehicleType.slice(1) : "—" },
            { icon: <IconMapPin   size={15} className="text-primary" />, label: "Payment", value: ride.paymentMethod ? ride.paymentMethod.charAt(0).toUpperCase() + ride.paymentMethod.slice(1) : "—" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-default-400">{label}</p>
                <p className="text-xs font-bold text-foreground truncate">{value || "—"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Driver ── */}
        {hasDriver && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
              {initials(ride.driver)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-default-400 uppercase tracking-wide font-semibold">Driver</p>
              <p className="text-sm font-bold text-foreground truncate">{ride.driver}</p>
              {(ride.vehicle || ride.plate) && (
                <p className="text-xs text-default-400 truncate">
                  {ride.vehicle}{ride.vehicle && ride.plate ? " · " : ""}{ride.plate}
                </p>
              )}
            </div>
            {ride.driverPhone && (
              <a
                href={`tel:${ride.driverPhone}`}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 text-white hover:bg-primary/90 transition-colors"
              >
                <IconPhone size={15} />
              </a>
            )}
          </div>
        )}

        {/* ── Fare ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
          <p className="text-[11px] text-default-400 font-semibold uppercase tracking-wide mb-3">Fare</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-default-500">
              <span>Base fare</span>
              <span>₹{Math.max(0, ride.fare - ride.tip).toLocaleString("en-IN")}</span>
            </div>
            {ride.tip > 0 && (
              <div className="flex justify-between text-sm text-default-500">
                <span>Tip</span>
                <span>₹{ride.tip.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base text-foreground border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-1">
              <span>Total</span>
              <span className="text-primary">₹{ride.fare.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* ── Transaction Details ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconReceipt size={14} className="text-default-400" />
            <p className="text-[11px] text-default-400 font-semibold uppercase tracking-wide">
              Transactions
              {(ride.transactions?.length ?? 0) > 1 && (
                <span className="ml-1.5 text-primary">({ride.transactions!.length})</span>
              )}
            </p>
          </div>

          {(ride.transactions?.length ?? 0) === 0 ? (
            <p className="text-xs text-default-400">No payment records found.</p>
          ) : (
            <div className="space-y-3">
              {ride.transactions!.map((txn, idx) => {
                const cfg = PAYMENT_STATUS_LABEL[txn.status] ?? PAYMENT_STATUS_LABEL.created;
                return (
                  <div
                    key={txn.id}
                    className={`space-y-2 ${idx > 0 ? "pt-3 border-t border-zinc-100 dark:border-zinc-800" : ""}`}
                  >
                    {(ride.transactions!.length > 1) && (
                      <p className="text-[10px] text-default-400 font-semibold uppercase tracking-wide">
                        Attempt {ride.transactions!.length - idx}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-default-400">Status</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
                        {cfg.text}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-default-400">Amount</span>
                      <span className="text-xs font-bold text-foreground">
                        ₹{parseFloat(txn.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-default-400">Method</span>
                      <div className="flex items-center gap-1.5">
                        <IconCreditCard size={12} className="text-default-400" />
                        <span className="text-xs font-semibold text-foreground capitalize">
                          {txn.method || "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-default-400">Paid At</span>
                      <span className="text-xs font-semibold text-foreground">{formatDateTime(txn.paidAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-default-400 shrink-0">Txn ID</span>
                      <span className="text-xs font-mono text-default-500 truncate max-w-[180px]">{txn.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Rating ── */}
        {ride.status === "completed" && (
          ride.rating > 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-default-400 uppercase tracking-wide font-semibold mb-1">Your Rating</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <IconStar
                      key={s}
                      size={18}
                      className={s <= ride.rating ? "text-warning fill-warning" : "text-zinc-200"}
                    />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-foreground">{ride.rating}/5</span>
                </div>
              </div>
              <button
                onClick={() => openRatingModal(ride)}
                className="text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
              >
                Edit
              </button>
            </div>
          ) : (
            <button
              onClick={() => openRatingModal(ride)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-2xl py-4 text-sm hover:bg-primary/90 active:scale-95 transition-all"
            >
              <IconStar size={16} /> Rate this Ride
            </button>
          )
        )}

        {/* ── Raise a Ticket ── */}
        <button
          onClick={() => openTicketModal(ride)}
          className="w-full flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 text-default-500 font-semibold rounded-2xl py-3.5 text-sm hover:border-primary hover:text-primary active:scale-95 transition-all"
        >
          <IconTicket size={16} /> Raise a Ticket
        </button>

      </div>
    </div>
  );
}

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
import { Button, Card, CardTitle } from "@heroui/react";
import { ResponsiveCard } from "@/components/ui/ResponsiveCard";

const STATUS_CONFIG = {
  completed: { bg: "bg-success", text: "Completed", dot: "bg-white" },
  ongoing: { bg: "bg-primary", text: "In Progress", dot: "bg-yellow-300" },
  confirmed: { bg: "bg-primary", text: "Confirmed", dot: "bg-white" },
  pending: { bg: "bg-warning", text: "Pending", dot: "bg-white" },
  cancelled: { bg: "bg-danger", text: "Cancelled", dot: "bg-white" },
} as const;

// Timeline steps in order
const TIMELINE_STEPS: { key: string; label: string }[] = [
  { key: "pending", label: "Booking Placed" },
  { key: "confirmed", label: "Driver Assigned" },
  { key: "ongoing", label: "Trip Started" },
  { key: "completed", label: "Trip Completed" },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  ongoing: 2,
  completed: 3,
  cancelled: -1,
};

const PAYMENT_STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  paid: { text: "Paid", cls: "text-success" },
  cash_collected: { text: "Cash Collected", cls: " text-success" },
  cash_pending: { text: "Cash Pending", cls: "text-warning" },
  created: { text: "Failed", cls: "text-danger" },
  refunded: { text: "Refunded", cls: " text-primary" },
  failed: { text: "Failed", cls: "text-danger" },
};

function formatDate(d: string) {
  if (!d) return "—";
  const [year, month, day] = d.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
          <IconCar size={24} className="text-muted" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">Ride not found</p>
          <p className="text-sm text-muted mt-1">
            This booking may have been removed.
          </p>
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

  const statusCfg = STATUS_CONFIG[ride.status] ?? STATUS_CONFIG.pending;
  const hasDriver = ride.driver && ride.driver !== "—" && ride.driver !== "";
  const currentStep = STATUS_ORDER[ride.status] ?? 0;
  const isCancelled = ride.status === "cancelled";

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* ── Hero Header ── */}
      <div className={`${statusCfg.bg} rounded-b-3xl px-4 pt-4 pb-6 mb-4`}>
        <Link
          href={ROUTES.dashboard.rides}
          className="inline-flex items-center gap-1 text-white/80 text-sm font-medium mb-4 hover:text-white transition-colors"
        >
          <ChevronLeft size={14} /> Ride History
        </Link>

        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium mb-0.5">#{ride.bookingRef}</p>
            {/* <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-white font-bold text-base leading-snug truncate max-w-[130px]">
                {ride.from}
              </span>
              <span className="text-white/60 text-sm shrink-0">→</span>
              <span className="text-white font-bold text-base leading-snug truncate max-w-[130px]">
                {ride.to}
              </span>
            </div> */}
          </div>
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.text}
          </span>
        </div>
      </div>

      <div className="md:px-4 space-y-4">
        {/* ── Status Timeline ── */}
        {!isCancelled && (
          <ResponsiveCard className=" pb-0">
            <Card.Header className="text-muted font-semibold">
              <Card.Title>Journey Progress</Card.Title>
            </Card.Header>
            <div className="flex flex-col gap-0">
              {TIMELINE_STEPS.map((step, i) => {
                const stepIdx = i;
                const isDone = currentStep > stepIdx;
                const isActive = currentStep === stepIdx;
                const isLast = i === TIMELINE_STEPS.length - 1;
                const tsKey = step.key as keyof NonNullable<
                  typeof ride.timelineAt
                >;
                const ts = ride.timelineAt?.[tsKey] ?? null;
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
                            isDone
                              ? "bg-success/40"
                              : "bg-zinc-200 dark:bg-zinc-700"
                          }`}
                        />
                      )}
                    </div>
                    {/* label + timestamp */}
                    <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                      <p
                        className={`text-sm font-semibold leading-tight ${
                          isDone || isActive ? "text-foreground" : "text-muted"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {ts
                          ? formatDateTime(ts)
                          : isDone || isActive
                            ? "—"
                            : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ResponsiveCard>
        )}

        {/* ── Cancelled notice ── */}
        {isCancelled && (
          <div className="mx-2 rounded-2xl border border-danger/20 bg-danger/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
              <IconX size={16} className="text-danger" />
            </div>
            <p className="text-sm text-danger font-medium">
              This ride was cancelled.
            </p>
          </div>
        )}

        {/* ── Route ── */}
        <ResponsiveCard className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
          <Card.Header className="text-sm font-semibold">
            <Card.Title>Route</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-row items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="w-px h-14 md:h-10 bg-zinc-200 dark:bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-muted">Pickup</p>
                <p className="text-sm font-semibold text-foreground">
                  {ride.from}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Drop-off</p>
                <p className="text-sm font-semibold text-foreground">
                  {ride.to}
                </p>
              </div>
            </div>
          </Card.Content>
        </ResponsiveCard>

        {/* ── Journey Details ── */}
        <div className="grid grid-cols-2 gap-2 px-2">
          {[
            {
              icon: <IconCalendar size={15} className="text-primary" />,
              label: "Booking Date",
              value: formatDate(ride.date),
            },
            {
              icon: <IconCalendar size={15} className="text-primary" />,
              label: "Journey Date",
              value: formatDate(ride.journeyDate),
            },
            {
              icon: <IconClock size={15} className="text-primary" />,
              label: "Time",
              value: formatTime(ride.journeyTime),
            },
            {
              icon: <IconMapPin size={15} className="text-primary" />,
              label: "Payment",
              value: ride.paymentMethod
                ? ride.paymentMethod.charAt(0).toUpperCase() +
                  ride.paymentMethod.slice(1)
                : "-",
            },
          ].map(({ icon, label, value }) => (
            <Card
              key={label}
              className="flex-row bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-3 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">{label}</p>
                <p className="text-sm font-bold text-foreground">
                  {value || "—"}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Driver ── */}
        {hasDriver && (
          <ResponsiveCard className="flex-row flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
              {initials(ride.driver)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted">Driver</p>
              <p className="text-lg font-semibold text-foreground truncate">
                {ride.driver}
              </p>
              {(ride.vehicle || ride.plate) && (
                <p className="text-xs text-muted truncate">
                  {ride.vehicle}
                  {ride.vehicle && ride.plate ? " · " : ""}
                  {ride.plate}
                </p>
              )}
            </div>
          </ResponsiveCard>
        )}

        {/* ── Fare ── */}
        <ResponsiveCard className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
          <Card.Header className="text-sm font-semibold">
            <Card.Title>Fare</Card.Title>
          </Card.Header>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-default-500">
              <span>Base fare</span>
              <span>
                ₹{Math.max(0, ride.fare - ride.tip).toLocaleString("en-IN")}
              </span>
            </div>
            {ride.tip > 0 && (
              <div className="flex justify-between text-sm text-default-500">
                <span>Tip</span>
                <span>₹{ride.tip.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base text-foreground border-t border-muted/30 pt-2 mt-1">
              <span>Total</span>
              <span className="text-primary">
                ₹{ride.fare.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </ResponsiveCard>

        {/* ── Transaction Details ── */}
        <ResponsiveCard className="">
          <Card.Header className="flex flex-row items-center gap-2 justify-start">
            <IconReceipt size={14} className="text-muted" />
            <Card.Title className="">
              Transactions
              {(ride.transactions?.length ?? 0) > 1 && (
                <span className="ml-1.5 text-primary">
                  ({ride.transactions!.length})
                </span>
              )}
            </Card.Title>
          </Card.Header>

          {(ride.transactions?.length ?? 0) === 0 ? (
            <p className="text-xs text-muted">No payment records found.</p>
          ) : (
            <div className="space-y-4">
              {ride.transactions!.map((txn, idx) => {
                const cfg =
                  PAYMENT_STATUS_LABEL[txn.status] ??
                  PAYMENT_STATUS_LABEL.created;
                return (
                  <div
                    key={txn.id}
                    className={`space-y-2 ${idx > 0 ? "pt-3 border-t border-zinc-100 dark:border-zinc-800" : ""}`}
                  >
                    {ride.transactions!.length > 1 && (
                      <p className="text-sm">
                        Attempt {ride.transactions!.length - idx}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Status</span>
                      <span className={`text-sm ${cfg.cls}`}>{cfg.text}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Amount</span>
                      <span className="text-sm text-foreground">
                        ₹{parseFloat(txn.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Method</span>
                      <div className="flex items-center gap-1.5">
                        <IconCreditCard size={16} className="text-muted" />
                        <span className="text-sm  text-foreground capitalize">
                          {txn.method || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Paid At</span>
                      <span className="text-sm text-foreground">
                        {formatDateTime(txn.paidAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted shrink-0">
                        Txn ID
                      </span>
                      <span className="text-sm font-mono">{txn.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ResponsiveCard>

        {/* ── Rating ── */}
        {ride.status === "completed" &&
          (ride.rating > 0 ? (
            <ResponsiveCard className="flex-row flex items-center justify-between gap-3">
              <div>
                <Card.Header className="text-sm">
                  <Card.Title> Your Rating</Card.Title>
                </Card.Header>
                <Card.Content className="mt-2 flex flex-row items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <IconStar
                      key={s}
                      size={18}
                      className={
                        s <= ride.rating
                          ? "text-warning fill-warning"
                          : "text-zinc-200"
                      }
                    />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-foreground">
                    {ride.rating}/5
                  </span>
                </Card.Content>
              </div>
              <Button size="sm" onClick={() => openRatingModal(ride)}>
                Edit
              </Button>
            </ResponsiveCard>
          ) : (
            <Button onPress={() => openRatingModal(ride)}>
              <IconStar size={16} /> Rate this Ride
            </Button>
          ))}

        {/* ── Raise a Ticket ── */}
        <div className="px-2">
          <Button
            onPress={() => {
              openTicketModal(ride);
            }}
            fullWidth
            variant="danger-soft"
          >
            <IconTicket size={16} /> Raise a Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}

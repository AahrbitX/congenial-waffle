"use client";

import Link from "next/link";
import { Chip } from "@heroui/react";
import { useMyTransaction } from "@/hooks/useTransactions";
import {
  IconArrowLeft,
  IconCar,
  IconLoader,
  IconCheckCircle,
  IconXCircle,
  IconClockAlert,
  IconArrowLeftRight,
  IconMapPin,
  IconCalendar,
  IconReceipt,
} from "@/constants/icons";
import { ROUTES } from "@/constants/routes";
import type { PaymentStatus } from "@/types/transactions.types";

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: "success" | "warning" | "danger" | "default"; icon: React.ReactNode; heroBg: string; heroText: string }
> = {
  paid:     { label: "Paid",     color: "success", icon: <IconCheckCircle   size={28} />, heroBg: "bg-success-light",   heroText: "text-success"        },
  created:  { label: "Pending",  color: "warning", icon: <IconClockAlert    size={28} />, heroBg: "bg-warning-light",   heroText: "text-warning"        },
  failed:   { label: "Failed",   color: "danger",  icon: <IconXCircle       size={28} />, heroBg: "bg-danger-light",    heroText: "text-danger"         },
  refunded: { label: "Refunded", color: "default", icon: <IconArrowLeftRight size={28}/>, heroBg: "bg-surface-muted",   heroText: "text-text-secondary" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionDetail({ id }: { id: string }) {
  const { data: tx, isLoading } = useMyTransaction(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <IconLoader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <IconReceipt size={48} className="text-border-strong" />
        <p className="text-base font-bold text-text-secondary">Transaction not found</p>
        <Link
          href={ROUTES.dashboard.transactions}
          className="text-primary text-sm font-semibold hover:underline"
        >
          ← Back to Transactions
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.created;

  const details = [
    { label: "Booking Ref",   value: tx.bookingRef },
    { label: "Route",         value: `${tx.pickupName} → ${tx.dropName}` },
    { label: "Journey Date",  value: `${formatDate(tx.journeyDate)} at ${formatTime(tx.journeyTime)}` },
    { label: "Amount",        value: `₹${parseFloat(tx.amount).toLocaleString("en-IN")} (${tx.currency})` },
    { label: "Mode",          value: tx.mode === "full" ? "Full Payment" : "Partial Payment" },
    { label: "Razorpay Order",value: tx.rzpOrderId },
    ...(tx.rzpPaymentId ? [{ label: "Payment ID",   value: tx.rzpPaymentId }] : []),
    ...(tx.paidAt        ? [{ label: "Paid At",      value: formatDateTime(tx.paidAt) }] : []),
    { label: "Created At",    value: formatDateTime(tx.createdAt) },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Back nav */}
      <Link
        href={ROUTES.dashboard.transactions}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition-colors"
      >
        <IconArrowLeft size={14} /> Back to Transactions
      </Link>

      {/* Hero card */}
      <div className={`rounded-2xl p-6 flex flex-col items-center gap-3 ${cfg.heroBg}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-surface shadow-sm ${cfg.heroText}`}>
          {cfg.icon}
        </div>
        <p className={`text-4xl font-black tracking-tight ${cfg.heroText}`}>
          ₹{parseFloat(tx.amount).toLocaleString("en-IN")}
        </p>
        <Chip color={cfg.color} variant="flat" size="sm" className="font-semibold">
          {cfg.label}
        </Chip>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <IconMapPin size={13} />
          {tx.pickupName} → {tx.dropName}
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <IconCalendar size={13} />
          {formatDate(tx.journeyDate)} at {formatTime(tx.journeyTime)}
        </div>
      </div>

      {/* Details list */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
        <p className="text-[11px] font-bold tracking-widest text-text-tertiary uppercase mb-4">
          Payment Details
        </p>
        {details.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <p className="text-[13px] text-text-tertiary shrink-0">{label}</p>
            <p className="text-[13px] font-semibold text-text-primary text-right break-all">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* View ride link */}
      <Link
        href={ROUTES.dashboard.rides}
        className="flex items-center justify-between w-full bg-surface border border-border rounded-2xl p-4 shadow-sm hover:border-primary transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center">
            <IconCar size={15} className="text-text-tertiary" />
          </div>
          <p className="text-[13px] font-semibold text-text-primary">View related ride</p>
        </div>
        <IconArrowLeft size={14} className="text-text-tertiary rotate-180" />
      </Link>
    </div>
  );
}

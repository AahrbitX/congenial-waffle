"use client";

import Link from "next/link";
import { Button, buttonVariants, Card, Chip, Skeleton } from "@heroui/react";
import { useMyTransaction } from "@/hooks/useTransactions";
import {
  IconArrowLeft,
  IconLoader,
  IconCheckCircle,
  IconXCircle,
  IconClockAlert,
  IconArrowLeftRight,
  IconReceipt,
} from "@/constants/icons";
import { ROUTES } from "@/constants/routes";
import type { PaymentStatus } from "@/types/transactions.types";
import { ResponsiveCard } from "@/components/ui/ResponsiveCard";

const STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    color: "success" | "warning" | "danger" | "default";
    icon: React.ReactNode;
    heroBg: string;
    heroText: string;
  }
> = {
  paid: {
    label: "Paid",
    color: "success",
    icon: <IconCheckCircle size={28} />,
    heroBg: "bg-success-light",
    heroText: "text-success",
  },
  created: {
    label: "Pending",
    color: "warning",
    icon: <IconClockAlert size={28} />,
    heroBg: "bg-warning-light",
    heroText: "text-warning",
  },
  cash_pending: {
    label: "Awaiting Code",
    color: "warning",
    icon: <IconClockAlert size={28} />,
    heroBg: "bg-warning-light",
    heroText: "text-warning",
  },
  cash_collected: {
    label: "Cash Confirmed",
    color: "default",
    icon: <IconCheckCircle size={28} />,
    heroBg: "bg-surface-muted",
    heroText: "text-text-secondary",
  },
  failed: {
    label: "Failed",
    color: "danger",
    icon: <IconXCircle size={28} />,
    heroBg: "bg-danger-light",
    heroText: "text-danger",
  },
  refunded: {
    label: "Refunded",
    color: "default",
    icon: <IconArrowLeftRight size={28} />,
    heroBg: "bg-surface-muted",
    heroText: "text-text-secondary",
  },
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
        <p className="text-base font-bold text-text-secondary">
          Transaction not found
        </p>
        <Link
          href={ROUTES.dashboard.transactions}
          className="text-muted text-sm"
        >
          <IconArrowLeft /> Back to Transactions
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.created;

  const details = [
    { label: "Booking Ref", value: tx.bookingRef },
    {
      label: "Mode",
      value: tx.mode === "full" ? "Full Payment" : "Partial Payment",
    },
    {
      label: "Journey Date",
      value: `${formatDate(tx.journeyDate)} at ${formatTime(tx.journeyTime)}`,
    },
    { label: "Razorpay Order", value: tx.rzpOrderId },
    ...(tx.rzpPaymentId
      ? [{ label: "Payment ID", value: tx.rzpPaymentId }]
      : []),
    ...(tx.paidAt
      ? [{ label: "Paid At", value: formatDateTime(tx.paidAt) }]
      : []),
    { label: "Created At", value: formatDateTime(tx.createdAt) },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Back nav */}
      <Link
        href={ROUTES.dashboard.transactions}
        className="inline-flex items-center gap-2 text-sm mt-4 ml-4"
      >
        <IconArrowLeft size={14} /> Back to Transactions
      </Link>

      {/* Hero card */}
      <div className={`p-2 flex flex-col items-center gap-3 ${cfg.heroBg}`}>
        <p className={`text-5xl font-bold ${cfg.heroText}`}>
          ₹{parseFloat(tx.amount).toLocaleString("en-IN")}
        </p>
        <Chip color={cfg.color} variant="soft" className="font-semibold">
          {cfg.label}
        </Chip>
      </div>

      <ResponsiveCard>
        <Card.Header>
          <Card.Title>Route Details</Card.Title>
        </Card.Header>

        <Card.Content className="flex flex-row items-start gap-3">
          <div className="flex flex-col items-center pt-1">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <div className="h-12 w-px bg-border" />
            <div className="h-3 w-3 rounded-full bg-danger" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-muted">Pickup Location</p>
              <p className="font-semibold">
                {tx.pickupName || "Not Available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted">Destination</p>
              <p className=" font-semibold">{tx.dropName || "Not Available"}</p>
            </div>
          </div>
        </Card.Content>
      </ResponsiveCard>

      {/* Details list */}
      <ResponsiveCard className="">
        <Card.Header>
          <Card.Title>Payment Details</Card.Title>
        </Card.Header>
        {details.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted shrink-0">{label}</p>
            <p className="text-sm text-right max-w-sm">{value}</p>
          </div>
        ))}
      </ResponsiveCard>

      {/* View ride link */}
      <div className="flex items-center justify-center gap-2 flex-col-reverse md:flex-row px-2 pb-6">
        <Button fullWidth variant="danger">
          Raise Ticket
        </Button>
        <Link
          className={buttonVariants({ variant: "primary", fullWidth: true })}
          href={`/dashboard/rides/${tx.bookingId}`}
        >
          View Related Ride
        </Link>
      </div>
    </div>
  );
}

export function TransactionDetailSkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Back button */}
      <Skeleton className="h-5 w-40 rounded-lg mt-4 ml-4" />

      {/* Hero */}
      <div className="rounded-3xl border p-6 flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-48 rounded-xl" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      {/* Route Details */}
      <ResponsiveCard>
        <Card.Header>
          <Skeleton className="h-6 w-32 rounded-lg" />
        </Card.Header>

        <Card.Content className="flex flex-row items-start gap-3">
          <div className="flex flex-col items-center pt-1">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-12 w-px" />
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2 rounded-lg" />
              <Skeleton className="h-5 w-full rounded-lg" />
            </div>

            <div>
              <Skeleton className="h-4 w-24 mb-2 rounded-lg" />
              <Skeleton className="h-5 w-5/6 rounded-lg" />
            </div>
          </div>
        </Card.Content>
      </ResponsiveCard>

      {/* Payment Details */}
      <ResponsiveCard>
        <Card.Header>
          <Skeleton className="h-6 w-36 rounded-lg" />
        </Card.Header>

        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex items-start justify-between gap-4">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-4 w-40 rounded-lg" />
            </div>
          ))}
        </div>
      </ResponsiveCard>

      {/* Actions */}
      <div className="flex flex-col-reverse md:flex-row gap-2 px-2 pb-6">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

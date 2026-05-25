"use client";

import { Card, Chip, Separator } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { useAdminVerifyPayment } from "@/hooks/useTransactions";
import {
  IconCheckCircle,
  IconXCircle,
  IconClockAlert,
  IconArrowLeftRight,
  IconCar,
  IconCreditCard,
} from "@/constants/icons";

type PaymentStatus = "created" | "paid" | "cash_pending" | "cash_collected" | "refunded" | "failed" | null;

interface Payment {
  id: string | null;
  fare: string;
  amount: string | null;
  status: PaymentStatus;
  method: string | null;
  mode: string | null;
  paidAt: string | null;
  cashVerifiedAt: string | null;
  adminVerifiedBy: string | null;
  adminVerifiedAt: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "warning" | "danger" | "default" | "primary"; icon: React.ReactNode }> = {
  paid:           { label: "Paid",           color: "success",  icon: <IconCheckCircle    size={13} /> },
  created:        { label: "Pending",        color: "warning",  icon: <IconClockAlert     size={13} /> },
  cash_pending:   { label: "Awaiting Code",  color: "warning",  icon: <IconClockAlert     size={13} /> },
  cash_collected: { label: "Cash Confirmed", color: "primary",  icon: <IconCheckCircle    size={13} /> },
  failed:         { label: "Failed",         color: "danger",   icon: <IconXCircle        size={13} /> },
  refunded:       { label: "Refunded",       color: "default",  icon: <IconArrowLeftRight size={13} /> },
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface PaymentDetailsProps {
  payment: Payment;
}

export default function PaymentDetails({ payment }: PaymentDetailsProps) {
  const adminVerify = useAdminVerifyPayment();

  const status = payment.status ?? "created";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.created;

  const totalFare   = parseFloat(payment.fare ?? "0");
  const paidAmount  = parseFloat(payment.amount ?? "0");
  const remaining   = totalFare - paidAmount;
  const isPartial   = payment.mode === "partial" && remaining > 0.01;

  const isCashCollected  = status === "cash_collected";
  const needsAdminVerify = isCashCollected && !payment.adminVerifiedAt;

  async function handleAdminAction(approved: boolean) {
    if (!payment.id) return;
    await adminVerify.mutateAsync({ paymentId: payment.id, approved });
  }

  return (
    <Card className="gap-2">
      <Card.Header className="flex flex-row items-center justify-between">
        <Card.Title>Payment &amp; Balance</Card.Title>
        {payment.status && (
          <Chip color={cfg.color} variant="flat" size="sm" className="text-[11px] font-semibold">
            <span className="flex items-center gap-1">{cfg.icon}{cfg.label}</span>
          </Chip>
        )}
      </Card.Header>
      <Separator />

      {!payment.id ? (
        <div className="px-4 pb-4 text-sm text-text-secondary">No payment record found for this booking.</div>
      ) : (
        <div className="px-4 pb-4 space-y-4">
          {/* Fare summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-muted p-3 space-y-0.5">
              <p className="text-[11px] text-text-tertiary uppercase tracking-wider">Total Fare</p>
              <p className="text-base font-bold text-text-primary">₹{totalFare.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-xl bg-surface-muted p-3 space-y-0.5">
              <p className="text-[11px] text-text-tertiary uppercase tracking-wider">Paid</p>
              <p className="text-base font-bold text-success">₹{paidAmount.toLocaleString("en-IN")}</p>
            </div>
            {isPartial && (
              <div className="col-span-2 rounded-xl bg-warning-light p-3 space-y-0.5">
                <p className="text-[11px] text-text-tertiary uppercase tracking-wider">Balance Due</p>
                <p className="text-base font-bold text-warning">₹{remaining.toLocaleString("en-IN")}</p>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted">
              {payment.method === "cash" ? <IconCar size={16} className="text-text-secondary" /> : <IconCreditCard size={16} className="text-text-secondary" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {payment.method === "cash" ? "Cash Payment" : "Online Payment"}
              </p>
              <p className="text-xs text-text-tertiary">
                {payment.mode === "partial" ? "Partial" : "Full"} · {payment.paidAt ? `Paid ${fmt(payment.paidAt)}` : "Not paid yet"}
              </p>
            </div>
          </div>

          {/* Cash collection details */}
          {(status === "cash_pending" || status === "cash_collected") && (
            <div className="rounded-xl border border-border p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Cash Collection</p>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Code Verified</span>
                <span className="font-medium text-text-primary">{payment.cashVerifiedAt ? fmt(payment.cashVerifiedAt) : "Pending"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Admin Verified</span>
                <span className="font-medium text-text-primary">{payment.adminVerifiedAt ? fmt(payment.adminVerifiedAt) : "Not yet"}</span>
              </div>
            </div>
          )}

          {/* Admin verify actions */}
          {needsAdminVerify && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-2">
              <p className="text-xs font-semibold text-text-primary">
                Passenger has entered the driver's code. Confirm cash was collected?
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onPress={() => handleAdminAction(true)}
                  disabled={adminVerify.isPending}
                  className="flex-1 rounded-xl bg-success text-white text-xs font-semibold"
                >
                  <IconCheckCircle size={13} />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => handleAdminAction(false)}
                  disabled={adminVerify.isPending}
                  className="flex-1 rounded-xl border-danger text-danger text-xs font-semibold"
                >
                  <IconXCircle size={13} />
                  Dispute
                </Button>
              </div>
            </div>
          )}

          {/* Verified badge */}
          {payment.adminVerifiedAt && (
            <div className="flex items-center gap-2 text-xs text-success font-medium">
              <IconCheckCircle size={14} />
              Verified by admin on {fmt(payment.adminVerifiedAt)}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

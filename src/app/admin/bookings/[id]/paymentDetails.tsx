"use client";

import { Card, Chip, Separator } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api-client";
import { toast } from "@heroui/react";
import {
  IconCheckCircle,
  IconXCircle,
  IconClockAlert,
  IconArrowLeftRight,
  IconCar,
  IconCreditCard,
} from "@/constants/icons";
import { BiQuestionMark } from "react-icons/bi";

type PaymentStatus =
  | "created"
  | "paid"
  | "cash_pending"
  | "cash_collected"
  | "refunded"
  | "failed"
  | null;

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

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: "success" | "warning" | "danger" | "default" | "accent";
    icon: React.ReactNode;
  }
> = {
  paid: {
    label: "Paid",
    color: "success",
    icon: <IconCheckCircle size={13} />,
  },
  created: {
    label: "Pending",
    color: "warning",
    icon: <IconClockAlert size={13} />,
  },
  cash_pending: {
    label: "Awaiting Code",
    color: "warning",
    icon: <IconClockAlert size={13} />,
  },
  cash_collected: {
    label: "Cash Confirmed",
    color: "accent",
    icon: <IconCheckCircle size={13} />,
  },
  failed: { label: "Failed", color: "danger", icon: <IconXCircle size={13} /> },
  refunded: {
    label: "Refunded",
    color: "default",
    icon: <IconArrowLeftRight size={13} />,
  },
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PaymentDetailsProps {
  payment: Payment;
  bookingId: string;
}

export default function PaymentDetails({
  payment,
  bookingId,
}: PaymentDetailsProps) {
  const qc = useQueryClient();

  const adminVerify = useMutation({
    mutationFn: ({
      paymentId,
      approved,
    }: {
      paymentId: string;
      approved: boolean;
    }) =>
      request(`/api/payments/${paymentId}/admin-verify`, {
        method: "PATCH",
        body: JSON.stringify({ approved }),
      }),
    onSuccess: (_data, { approved }) => {
      qc.invalidateQueries({ queryKey: ["booking", bookingId] });
      toast.success(approved ? "Payment approved" : "Payment disputed");
    },
    onError: () => toast("Action failed", { variant: "danger" }),
  });

  const status = payment.status ?? "created";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.created;

  const totalFare = parseFloat(payment.fare ?? "0");
  const paidAmount = parseFloat(payment.amount ?? "0");
  const remaining = totalFare - paidAmount;
  const isPartial = payment.mode === "partial" && remaining > 0.01;

  const isCashCollected = status === "cash_collected";
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
          <Chip
            color={cfg.color}
            variant="soft"
            size="sm"
            className="text-[11px] font-semibold"
          >
            <span className="flex items-center gap-1">
              {cfg.icon}
              {cfg.label}
            </span>
          </Chip>
        )}
      </Card.Header>
      <Separator />

      {!payment.id ? (
        <Card.Content className="text-sm text-text-secondary">
          No payment record found for this booking.
        </Card.Content>
      ) : (
        <Card.Content className="space-y-3">
          {/* Fare summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card variant="secondary">
              <Card.Header className="flex flex-row items-center justify-between">
                <p className="text-xs text-muted font-medium">Total Fare</p>
                <p className="text-xs cursor-pointer">?</p>
              </Card.Header>

              <Card.Content className="text-xl font-bold">
                ₹{totalFare.toLocaleString("en-IN")}
              </Card.Content>
            </Card>

            <Card variant="secondary">
              <Card.Header className="text-xs text-muted font-medium">
                Paid
              </Card.Header>
              <Card.Content className="text-xl font-bold text-success">
                ₹{paidAmount.toLocaleString("en-IN")}
              </Card.Content>
            </Card>

            {isPartial && (
              <Card
                variant="secondary"
                className="col-span-2 border-warning/20"
              >
                <Card.Header className="text-xs text-muted font-medium">
                  Remaining Balance
                </Card.Header>

                <Card.Content className="text-xl font-bold text-warning">
                  ₹{remaining.toLocaleString("en-IN")}
                </Card.Content>
              </Card>
            )}
          </div>

          {/* Payment method */}
          <Card variant="secondary">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/10">
                {payment.method === "cash" ? (
                  <IconCar size={18} />
                ) : (
                  <IconCreditCard size={18} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">
                  {payment.method === "cash"
                    ? "Cash Payment"
                    : "Online Payment"}
                </p>

                <p className="text-xs text-muted font-medium">
                  {payment.mode === "partial"
                    ? "Partial Payment"
                    : payment.mode === "balance"
                      ? "Balance Payment"
                      : "Full Payment"}
                </p>
              </div>
            </div>

            <Separator variant="secondary" />

            <Card.Footer className="flex justify-between text-xs">
              <span className="font-medium text-muted">Payment Date</span>

              <span className="font-medium text-text-primary">
                {payment.paidAt
                  ? fmt(payment.paidAt)
                  : payment.cashVerifiedAt
                    ? fmt(payment.cashVerifiedAt)
                    : "-"}
              </span>
            </Card.Footer>
          </Card>

          {/* Cash collection details */}
          {(status === "cash_pending" || status === "cash_collected") && (
            <div className="rounded-xl border border-border p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                Cash Collection
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Code Verified</span>
                <span className="font-medium text-text-primary">
                  {payment.cashVerifiedAt
                    ? fmt(payment.cashVerifiedAt)
                    : "Pending"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Admin Verified</span>
                <span className="font-medium text-text-primary">
                  {payment.adminVerifiedAt
                    ? fmt(payment.adminVerifiedAt)
                    : "Not yet"}
                </span>
              </div>
            </div>
          )}

          {/* Admin verify actions */}
          {needsAdminVerify && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-2">
              <p className="text-xs font-semibold text-text-primary">
                Passenger has entered the driver&apos;s code. Confirm cash was
                collected?
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
        </Card.Content>
      )}
    </Card>
  );
}

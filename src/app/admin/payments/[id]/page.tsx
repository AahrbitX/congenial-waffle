"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Separator,
  Surface,
} from "@heroui/react";
import { Printer } from "lucide-react";
import Link from "next/link";
import { request } from "@/lib/api-client";
import { STATUS_COLOR, STATUS_LABEL } from "../columns";

type TransactionDetail = {
  id: string;
  bookingId: string;
  bookingRef: string;
  rzpOrderId: string;
  rzpPaymentId: string | null;
  amount: string;
  currency: string;
  status: string;
  mode: string;
  paymentMethod: string;
  paidAt: string | null;
  cashVerifiedAt: string | null;
  adminVerifiedBy: string | null;
  adminVerifiedAt: string | null;
  createdAt: string;
  journeyDate: string;
  journeyTime: string;
  totalFare: string;
  bookingStatus: string;
  vehicleType: string;
  members: number;
  userName: string;
  userPhone: string;
  pickupName: string;
  dropName: string;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5">
      <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

function fmt(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery<{ success: boolean; data: TransactionDetail }>({
    queryKey: ["admin-payment", id],
    queryFn: () => request(`/api/payments/admin/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Surface className="h-full p-4" variant="secondary">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Surface>
    );
  }

  const tx = data?.data;
  if (!tx) {
    return (
      <Surface className="h-full p-4" variant="secondary">
        <p className="text-sm text-danger">Transaction not found.</p>
      </Surface>
    );
  }

  return (
    <Surface className="h-full overflow-y-auto p-4 scrollbar-thin" variant="secondary">
      {/* Breadcrumb */}
      <Breadcrumbs className="mb-4">
        <Breadcrumbs.Item href="/admin/payments">Payments</Breadcrumbs.Item>
        <Breadcrumbs.Item>{tx.id.slice(0, 8).toUpperCase()}…</Breadcrumbs.Item>
      </Breadcrumbs>

      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold font-mono">{tx.id}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Transaction Detail</p>
        </div>
        <Chip
          size="sm"
          color={STATUS_COLOR[tx.status] ?? "default"}
          variant="soft"
        >
          {STATUS_LABEL[tx.status] ?? tx.status}
        </Chip>
        {(tx.status === "paid" || tx.status === "cash_collected") && (
          <Button
            variant="secondary"
            className="ml-auto"
            onPress={() => window.open(`/admin/payments/${tx.id}/invoice`, "_blank")}
          >
            <Printer size={15} />
            Print Invoice
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Info */}
        <Card>
          <Card.Header>
            <Card.Title className="text-base">Payment Details</Card.Title>
          </Card.Header>
          <Card.Content className="pt-0">
            <DetailRow label="Transaction ID" value={<span className="font-mono text-xs">{tx.id}</span>} />
            <Separator />
            <DetailRow
              label="Razorpay Order ID"
              value={<span className="font-mono text-xs">{tx.rzpOrderId}</span>}
            />
            <Separator />
            <DetailRow
              label="Razorpay Payment ID"
              value={
                tx.rzpPaymentId ? (
                  <span className="font-mono text-xs">{tx.rzpPaymentId}</span>
                ) : (
                  <span className="text-muted-foreground text-xs">Not captured</span>
                )
              }
            />
            <Separator />
            <DetailRow
              label="Amount"
              value={`₹${parseFloat(tx.amount).toLocaleString("en-IN")} (${tx.mode})`}
            />
            <Separator />
            <DetailRow label="Method" value={<span className="capitalize">{tx.paymentMethod}</span>} />
            <Separator />
            <DetailRow label="Currency" value={tx.currency} />
            <Separator />
            <DetailRow label="Created At" value={fmt(tx.createdAt)} />
            <Separator />
            <DetailRow label="Paid At" value={fmt(tx.paidAt)} />
            {tx.cashVerifiedAt && (
              <>
                <Separator />
                <DetailRow label="Cash Verified At" value={fmt(tx.cashVerifiedAt)} />
              </>
            )}
            {tx.adminVerifiedAt && (
              <>
                <Separator />
                <DetailRow label="Admin Verified At" value={fmt(tx.adminVerifiedAt)} />
              </>
            )}
          </Card.Content>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Booking Info */}
          <Card>
            <Card.Header>
              <Card.Title className="text-base">Booking Details</Card.Title>
            </Card.Header>
            <Card.Content className="pt-0">
              <DetailRow
                label="Booking ID"
                value={
                  <Link
                    href={`/admin/bookings/${tx.bookingId}`}
                    className="text-accent font-bold hover:underline underline-offset-2 text-xs font-mono"
                  >
                    {tx.bookingRef || tx.bookingId}
                  </Link>
                }
              />
              <Separator />
              <DetailRow label="Journey Date" value={tx.journeyDate} />
              <Separator />
              <DetailRow label="Journey Time" value={tx.journeyTime} />
              <Separator />
              <DetailRow label="Pickup" value={tx.pickupName} />
              <Separator />
              <DetailRow label="Drop" value={tx.dropName} />
              <Separator />
              <DetailRow label="Vehicle" value={<span className="capitalize">{tx.vehicleType}</span>} />
              <Separator />
              <DetailRow label="Members" value={tx.members} />
              <Separator />
              <DetailRow label="Total Fare" value={`₹${parseFloat(tx.totalFare).toLocaleString("en-IN")}`} />
              <Separator />
              <DetailRow
                label="Booking Status"
                value={<span className="capitalize">{tx.bookingStatus}</span>}
              />
            </Card.Content>
          </Card>

          {/* User Info */}
          <Card>
            <Card.Header>
              <Card.Title className="text-base">Paid By</Card.Title>
            </Card.Header>
            <Card.Content className="pt-0">
              <DetailRow label="Name" value={tx.userName} />
              <Separator />
              <DetailRow label="Phone" value={tx.userPhone} />
            </Card.Content>
          </Card>
        </div>
      </div>
    </Surface>
  );
}

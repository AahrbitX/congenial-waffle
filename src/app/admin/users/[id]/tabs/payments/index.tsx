"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, Skeleton, Tabs, Table } from "@heroui/react";
import { request } from "@/lib/api-client";
import { IconCreditCard } from "@/constants/icons";
import Link from "next/link";

const STATUS_COLOR: Record<
  string,
  "success" | "warning" | "danger" | "default"
> = {
  paid: "success",
  cash_collected: "success",
  cash_pending: "warning",
  created: "warning",
  refunded: "default",
  failed: "danger",
};

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="border-b border-border bg-surface px-4 py-3 flex gap-8">
        {["w-20", "w-16", "w-16", "w-16", "w-24", "w-20"].map((w, i) => (
          <Skeleton key={i} className={`h-3 ${w} rounded`} />
        ))}
      </div>

      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex gap-8 px-4 py-4 border-b border-border last:border-0"
        >
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-default/60 flex items-center justify-center">
        <IconCreditCard size={24} className="text-muted" />
      </div>

      <p className="text-sm font-semibold text-foreground">No payments yet</p>

      <p className="text-xs text-muted max-w-xs">
        This user hasn&apos;t made any payments.
      </p>
    </div>
  );
}

function formatDate(date?: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Payment {
  id: string;
  bookingId: string;
  bookingRef?: string;
  amount: string;
  mode?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt?: string;
  status: string;
}

export default function PaymentsTab({
  userId,
  panelId,
}: {
  userId: string;
  panelId: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-payments", userId],
    queryFn: () =>
      request<{
        success: boolean;
        data: Payment[];
      }>(`/api/payments/admin?userId=${userId}`),
  });

  const payments = data?.data ?? [];

  return (
    <Tabs.Panel id={panelId} className="pt-2 px-0">
      {isLoading ? (
        <LoadingSkeleton />
      ) : payments.length === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="User payments" className="min-w-[720px]">
              <Table.Header>
                <Table.Column isRowHeader>Booking</Table.Column>
                <Table.Column>Amount</Table.Column>
                <Table.Column>Mode</Table.Column>
                <Table.Column>Method</Table.Column>
                <Table.Column>Date</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column>Actions</Table.Column>
              </Table.Header>

              <Table.Body>
                {payments.map((payment) => (
                  <Table.Row key={payment.id}>
                    <Table.Cell>
                      <Link
                        href={`/admin/bookings/${payment.bookingId}`}
                        className="font-mono text-sm text-accent font-bold hover:underline cursor-pointer underline-offset-2"
                      >
                        {payment.bookingRef}
                      </Link>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="font-semibold">
                        ₹{Number(payment.amount ?? 0).toLocaleString("en-IN")}
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="capitalize">{payment.mode ?? "—"}</span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="capitalize">
                        {payment.paymentMethod ?? "—"}
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="text-muted whitespace-nowrap">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={STATUS_COLOR[payment.status] ?? "default"}
                        className="capitalize"
                      >
                        {payment.status.replaceAll("_", " ")}
                      </Chip>
                    </Table.Cell>

                    <Table.Cell>
                      <Link
                        href={`/admin/payments/${payment.id}`}
                        className="font-mono text-accent font-bold hover:underline cursor-pointer underline-offset-2"
                      >
                        View Transaction
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </Tabs.Panel>
  );
}

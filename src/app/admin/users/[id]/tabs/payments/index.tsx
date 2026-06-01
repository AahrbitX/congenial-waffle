"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, Skeleton, Tabs } from "@heroui/react";
import { request } from "@/lib/api-client";
import { IconCreditCard } from "@/constants/icons";

const STATUS_COLOR: Record<string, "success" | "warning" | "danger" | "default"> = {
  paid:           "success",
  cash_collected: "success",
  cash_pending:   "warning",
  created:        "warning",
  refunded:       "default",
  failed:         "danger",
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
        <div key={i} className="flex gap-8 px-4 py-4 border-b border-border last:border-0">
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
      <p className="text-xs text-muted max-w-xs">This user hasn&apos;t made any payments.</p>
    </div>
  );
}

export default function PaymentsTab({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-payments", userId],
    queryFn: () => request<{ success: boolean; data: any[] }>(
      `/api/payments/admin?userId=${userId}`
    ),
  });

  const payments = data?.data ?? [];

  return (
    <Tabs.Panel className="pt-2 px-0" id="payments">
      {isLoading ? (
        <LoadingSkeleton />
      ) : payments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-semibold text-muted uppercase tracking-wide">
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary font-semibold">{p.bookingRef ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold">₹{parseFloat(p.amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 capitalize">{p.mode}</td>
                  <td className="px-4 py-3 capitalize">{p.paymentMethod}</td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <Chip size="sm" color={STATUS_COLOR[p.status] ?? "default"} variant="soft">
                      {p.status.replace(/_/g, " ")}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Tabs.Panel>
  );
}

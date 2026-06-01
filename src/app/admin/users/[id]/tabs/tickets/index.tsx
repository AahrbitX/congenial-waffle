"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, Tabs } from "@heroui/react";
import { request } from "@/lib/api-client";

const STATUS_COLOR: Record<string, "success" | "warning" | "danger" | "default" | "primary"> = {
  open:        "warning",
  in_progress: "primary",
  resolved:    "success",
  closed:      "default",
};

export default function TicketsTab({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-tickets", userId],
    queryFn: () => request<{ success: boolean; data: any[] }>(
      `/api/tickets?userId=${userId}`
    ),
  });

  const tickets = data?.data ?? [];

  return (
    <Tabs.Panel className="pt-2 px-0" id="tickets">
      {isLoading ? (
        <p className="text-sm text-muted-foreground p-4">Loading…</p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4">No support tickets found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-semibold text-muted uppercase tracking-wide">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.map((t: any) => (
                <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.subject}</p>
                    {t.description && (
                      <p className="text-xs text-muted line-clamp-1">{t.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">{t.category.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <Chip size="sm" color={STATUS_COLOR[t.status] ?? "default"} variant="soft">
                      {t.status.replace(/_/g, " ")}
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

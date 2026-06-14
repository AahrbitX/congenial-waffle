"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Tabs } from "@heroui/react";
import { request } from "@/lib/api-client";
import { IconStar } from "@/constants/icons";

function StarRating({ value }: { value: number }) {
  return (
    <span className="text-warning font-bold tracking-tight">
      {"★".repeat(value)}
      {"☆".repeat(5 - value)}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-default/60 flex items-center justify-center">
        <IconStar size={24} className="text-muted" />
      </div>
      <p className="text-sm font-semibold text-foreground">No reviews yet</p>
      <p className="text-xs text-muted max-w-xs">
        This user hasn&apos;t submitted any reviews.
      </p>
    </div>
  );
}

export default function ReviewsTab({
  userId,
  panelId,
}: {
  userId: string;
  panelId: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-reviews", userId],
    queryFn: () =>
      request<{ success: boolean; data: any[] }>(
        `/api/reviews?userId=${userId}`,
      ),
  });

  const reviews = data?.data ?? [];

  return (
    <Tabs.Panel className="pt-2 px-0" id={panelId}>
      {isLoading ? (
        <LoadingSkeleton />
      ) : reviews.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-surface p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary font-semibold">
                  {r.bookingRef}
                </span>
                <span className="text-xs text-muted">
                  {r.submittedAt
                    ? new Date(r.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StarRating value={r.rating} />
                <span className="text-xs text-muted">
                  {r.pickupName} → {r.dropName}
                </span>
              </div>
              {r.comment && (
                <p className="text-sm text-foreground leading-relaxed">
                  &quot;{r.comment}&quot;
                </p>
              )}
              {r.driverName && (
                <p className="text-xs text-muted">Driver: {r.driverName}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Tabs.Panel>
  );
}

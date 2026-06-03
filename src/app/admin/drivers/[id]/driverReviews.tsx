"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton, Tabs } from "@heroui/react";
import { RefreshCcw } from "lucide-react";
import { request } from "@/lib/api-client";
import { IconStar } from "@/constants/icons";

function StarRating({ value }: { value: number }) {
  return (
    <span className="text-warning font-bold tracking-tight">
      {"★".repeat(value)}{"☆".repeat(5 - value)}
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
        </div>
      ))}
    </div>
  );
}

export default function DriverReviewsTab({ driverId }: { driverId: string }) {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["driver-reviews", driverId],
    queryFn: () => request<{ success: boolean; data: any[] }>(
      `/api/reviews/admin?driverId=${driverId}`
    ),
  });

  const reviews = data?.data ?? [];

  return (
    <Tabs.Panel className="pt-2 px-0" id="reviews">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-muted">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        <Button isIconOnly variant="ghost" size="sm" onPress={() => refetch()} isDisabled={isFetching}>
          <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} />
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-default/60 flex items-center justify-center">
            <IconStar size={24} className="text-muted" />
          </div>
          <p className="text-sm font-semibold">No reviews yet</p>
          <p className="text-xs text-muted">This driver hasn&apos;t received any reviews.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-border bg-surface p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary font-semibold">{r.bookingRef}</span>
                <span className="text-xs text-muted">
                  {r.submittedAt
                    ? new Date(r.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StarRating value={r.rating} />
                <span className="text-xs text-muted">{r.pickupName} → {r.dropName}</span>
              </div>
              {r.comment && (
                <p className="text-sm text-foreground leading-relaxed">&quot;{r.comment}&quot;</p>
              )}
              <p className="text-xs text-muted">Rider: {r.customerName}</p>
            </div>
          ))}
        </div>
      )}
    </Tabs.Panel>
  );
}

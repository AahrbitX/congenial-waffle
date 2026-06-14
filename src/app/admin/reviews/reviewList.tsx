"use client";

import React, { useState } from "react";
import { Card, ScrollShadow, Skeleton, toast } from "@heroui/react";
import { Star } from "lucide-react";

import { Review } from "@/types/reviews.types";
import { request } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import ReviewDetail from "./reviewDetail";
import ReviewListCard from "./reviewListCard";

export default function ReviewList({
  reviews,
  isLoading,
}: {
  reviews: Review[];
  isLoading: boolean;
}) {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const flagMutation = useMutation({
    mutationFn: (id: string) =>
      request(`/api/reviews/${id}/flag`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
    onError: () => toast.danger("Could not update flag"),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) =>
      request(`/api/reviews/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  function selectRow(r: Review) {
    setSelectedId(r.id);
    if (r.unread) {
      readMutation.mutate(r.id);
    }
  }

  const selected =
    reviews.find((r) => r.id === selectedId) ?? reviews[0] ?? null;

  if (isLoading) {
    return (
      <div
        className="flex-1 grid gap-4 overflow-y-auto"
        style={{ gridTemplateColumns: "minmax(320px,1fr) 1.6fr" }}
      >
        <Card className="h-full overflow-hidden">
          <Card.Content className="space-y-2 p-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </Card.Content>
        </Card>
        <Card className="h-full overflow-hidden">
          <Card.Content className="space-y-3 p-4">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="flex-1 h-[80vh] grid gap-3 pb-10"
      style={{ gridTemplateColumns: "minmax(320px,1fr) 1.6fr" }}
    >
      {/* ── List panel ────────────────────────────────────────────────────── */}
      <Card className="h-full overflow-hidden flex flex-col gap-0">
        {/* header */}
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-primary">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-muted">Sorted by date</span>
        </div>

        <ScrollShadow className="flex-1 overflow-y-auto scrollbar-thin">
          {reviews.length === 0 && (
            <p className="py-14 text-center text-sm text-muted">
              No reviews match this filter.
            </p>
          )}
          {reviews.map((review) => {
            const isActive = selected?.id === review.id;
            return (
              <ReviewListCard
                key={review.id}
                review={review}
                isActive={isActive}
                selectReview={selectRow}
              />
            );
          })}
        </ScrollShadow>
      </Card>

      {/* ── Detail panel ──────────────────────────────────────────────────── */}
      {selected ? (
        <ReviewDetail review={selected} />
      ) : (
        <Card className="h-full flex items-center justify-center">
          <p className="text-sm text-muted">Select a review to read</p>
        </Card>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Card, Label, Meter, Skeleton } from "@heroui/react";
import { Star, BellDot, Flag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api-client";

type Stats = {
  average: number;
  total: number;
  distribution: { rating: number; count: number }[];
  unreadCount?: number;
  flaggedCount?: number;
};

export default function ReviewStats() {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ["reviews-stats"],
    queryFn: () => request("/api/reviews/stats"),
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <Card.Content className="p-4 space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-10 w-16 rounded" />
            </Card.Content>
          </Card>
        ))}
      </div>
    );
  }

  const average = data?.average ?? 0;
  const total = data?.total ?? 0;
  const unreadCount = data?.unreadCount ?? 0;
  const flaggedCount = data?.flaggedCount ?? 0;
  const distribution =
    data?.distribution ?? [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: 0 }));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      {/* Overall Rating */}
      <Card>
        <Card.Title>Overall Rating</Card.Title>
        <Card.Content>
          <div className="flex items-end gap-1">
            <h2 className="text-4xl font-bold">{average.toFixed(2)}</h2>
            <span className="pb-1 text-sm text-muted">/ 5.00</span>
          </div>
          <div className="flex items-center gap-0.5 text-orange-500 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.round(average) ? "currentColor" : "none"}
              />
            ))}
          </div>
        </Card.Content>
        <Card.Footer className="text-sm text-muted">
          Based on feedback
        </Card.Footer>
      </Card>

      {/* Star Distribution */}
      <Card className="lg:col-span-2">
        <Card.Title>Star Distribution</Card.Title>
        <Card.Content>
          <div className="space-y-1">
            {distribution.map(({ rating, count: c }) => {
              const pct = total > 0 ? (c / total) * 100 : 0;
              return (
                <div
                  key={rating}
                  className="grid grid-cols-[16px_16px_1fr_28px] items-center gap-3"
                >
                  <Label className="text-sm font-medium">{rating}</Label>
                  <Star size={12} className="fill-accent text-accent" />
                  <Meter
                    aria-label={`${rating} star`}
                    value={pct}
                    className="w-full"
                  >
                    <Meter.Track>
                      <Meter.Fill />
                    </Meter.Track>
                  </Meter>
                  <span className="text-sm text-muted text-right">{c}</span>
                </div>
              );
            })}
          </div>
        </Card.Content>
      </Card>

      {/* Total Reviews */}
      <Card>
        <Card.Title>Total Reviews</Card.Title>
        <Card.Content>
          <h2 className="text-5xl font-bold">{total}</h2>
        </Card.Content>
        <Card.Footer className="text-sm text-muted">All time</Card.Footer>
      </Card>

      {/* Unread */}
      <Card>
        <Card.Title className="flex items-center gap-1.5">
          <BellDot size={14} className="text-primary" />
          Unread
        </Card.Title>
        <Card.Content>
          <h2
            className={`text-5xl font-bold ${unreadCount > 0 ? "text-primary" : ""}`}
          >
            {unreadCount}
          </h2>
        </Card.Content>
        <Card.Footer className="text-sm text-muted">Need attention</Card.Footer>
      </Card>

      {/* Flagged */}
      <Card>
        <Card.Title className="flex items-center gap-1.5">
          <Flag size={14} className="text-danger" />
          Flagged
        </Card.Title>
        <Card.Content>
          <h2
            className={`text-5xl font-bold ${flaggedCount > 0 ? "text-danger" : ""}`}
          >
            {flaggedCount}
          </h2>
        </Card.Content>
        <Card.Footer className="text-sm text-muted">
          Marked for review
        </Card.Footer>
      </Card>
    </div>
  );
}

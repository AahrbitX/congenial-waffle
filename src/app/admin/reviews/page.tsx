"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, SearchField, Surface } from "@heroui/react";
import { RefreshCcw } from "lucide-react";
import { request } from "@/lib/api-client";

import ReviewStats from "./reviewStats";
import ReviewList from "./reviewList";
import { Review } from "@/types/reviews.types";

type ReviewsResponse = {
  success: boolean;
  stats: {
    average: number;
    total: number;
    distribution: { rating: number; count: number }[];
    unreadCount: number;
    flaggedCount: number;
  };
  data: Review[];
};

type FilterKey = "all" | "unread" | "5star" | "low" | "flagged";

const TAB_LABELS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Reviews" },
  { key: "unread", label: "Unread" },
  { key: "5star", label: "5 Stars" },
  { key: "low", label: "Low Rated" },
  { key: "flagged", label: "Flagged" },
];

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery<ReviewsResponse>({
    queryKey: ["reviews"],
    queryFn: () => request("/api/reviews"),
  });

  const reviews = data?.data ?? [];
  const stats = data?.stats;

  const byTab: Review[] = (() => {
    switch (filter) {
      case "unread":
        return reviews.filter((r) => r.unread);
      case "5star":
        return reviews.filter((r) => r.rating === 5);
      case "low":
        return reviews.filter((r) => r.rating <= 3);
      case "flagged":
        return reviews.filter((r) => r.flagged);
      default:
        return reviews;
    }
  })();

  const q = search.toLowerCase();
  const filtered: Review[] = search
    ? byTab.filter(
        (r) =>
          r.customerName?.toLowerCase().includes(q) ||
          r.driverName?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q),
      )
    : byTab;

  const counts: Record<FilterKey, number> = {
    all: reviews.length,
    unread: stats?.unreadCount ?? reviews.filter((r) => r.unread).length,
    "5star": reviews.filter((r) => r.rating === 5).length,
    low: reviews.filter((r) => r.rating <= 3).length,
    flagged: stats?.flaggedCount ?? reviews.filter((r) => r.flagged).length,
  };

  return (
    <Surface
      variant="secondary"
      className="h-full min-h-0 p-4 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Reviews</h1>
          <Button isIconOnly variant="ghost" onPress={() => refetch()}>
            <RefreshCcw size={16} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="shrink-0">
        <ReviewStats />
      </div>

      {/* Search */}
      <div className="shrink-0 flex items-center gap-2 ">
        <SearchField
          name="search"
          variant="primary"
          value={search}
          onChange={setSearch}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by customer, driver or comment" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>

      <div className="h-[100vh] space-y-4">
        {/* Filter tabs */}
        <div className="shrink-0 flex items-center gap-1 border-b border-border ">
          {TAB_LABELS.map(({ key, label }) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[1px]
                ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
                {counts[key] > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${isActive ? "bg-primary/10 text-primary" : "bg-surface-muted text-text-tertiary"}`}
                  >
                    {counts[key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* List */}
        <ReviewList reviews={filtered} isLoading={isLoading} />{" "}
      </div>
    </Surface>
  );
}

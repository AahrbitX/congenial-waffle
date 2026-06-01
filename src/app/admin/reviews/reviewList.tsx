"use client";

import React, { useState } from "react";
import { Card, Chip, Separator, Skeleton, toast } from "@heroui/react";
import { Star, Archive, Forward, Flag, Send, X, Car, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api-client";

export type AdminReview = {
  id: string;
  bookingId: string;
  bookingRef: string;
  rating: number;
  comment: string | null;
  flagged: boolean;
  unread: boolean;
  submittedAt: string;
  journeyDate: string;
  customerName: string;
  customerPhone: string;
  pickupName: string;
  dropName: string;
  totalFare: string | null;
  vehicleType: string | null;
  ac: boolean | null;
  driverName: string | null;
  vehicleNumber: string | null;
  distanceKm: number | null;
  ratingPunctuality: number | null;
  ratingCleanliness: number | null;
  ratingBehavior: number | null;
  ratingDriving: number | null;
};

// ── helpers ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

const RATING_LABEL: Record<number, string> = { 5: "Excellent", 4: "Great", 3: "Good", 2: "Fair", 1: "Poor" };
const RATING_COLOR: Record<number, "success" | "accent" | "warning" | "danger"> = {
  5: "success", 4: "success", 3: "accent", 2: "warning", 1: "danger",
};

const ASPECTS = ["Punctuality", "Cleanliness", "Behavior", "Driving"] as const;

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "fill-orange-400 text-orange-400" : "text-text-tertiary"}
        />
      ))}
    </div>
  );
}

function AspectBar({ label, value, isFallback }: { label: string; value: number; isFallback?: boolean }) {
  const color = value >= 4 ? "#10B981" : value === 3 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="text-xs text-text-secondary w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(value / 5) * 100}%`, background: isFallback ? "#CBD5E1" : color }} />
      </div>
      <span className={`text-[11px] font-bold w-5 text-right ${isFallback ? "text-text-tertiary" : "text-text-primary"}`}>
        {isFallback ? "—" : `${value}.0`}
      </span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function ReviewList({
  reviews,
  isLoading,
}: {
  reviews: AdminReview[];
  isLoading: boolean;
}) {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen]   = useState(false);
  const [replyText, setReplyText]   = useState("");

  const flagMutation = useMutation({
    mutationFn: (id: string) => request(`/api/reviews/${id}/flag`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
    onError: () => toast.danger("Could not update flag"),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => request(`/api/reviews/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  function selectRow(r: AdminReview) {
    setSelectedId(r.id);
    setReplyOpen(false);
    setReplyText("");
    if (r.unread) readMutation.mutate(r.id);
  }

  const selected = reviews.find((r) => r.id === selectedId) ?? reviews[0] ?? null;

  if (isLoading) {
    return (
      <div
        className="flex-1 min-h-0 grid gap-3 overflow-hidden"
        style={{ gridTemplateColumns: "minmax(320px,1fr) 1.6fr" }}
      >
        <Card className="h-full overflow-hidden">
          <Card.Content className="space-y-2 p-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
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
      className="flex-1 min-h-0 grid gap-3 overflow-hidden"
      style={{ gridTemplateColumns: "minmax(320px,1fr) 1.6fr" }}
    >
      {/* ── List panel ────────────────────────────────────────────────────── */}
      <Card className="h-full overflow-hidden flex flex-col">
        {/* header */}
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[13px] font-bold text-text-primary">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[11px] text-text-tertiary">Sorted by date</span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {reviews.length === 0 && (
            <p className="py-14 text-center text-sm text-text-tertiary">No reviews match this filter.</p>
          )}
          {reviews.map((r) => {
            const isActive = selected?.id === r.id;
            const driverLabel = r.driverName ?? "No driver";
            return (
              <button
                key={r.id}
                onClick={() => selectRow(r)}
                className={`w-full text-left px-4 py-3.5 border-b border-border/50 transition-colors flex gap-3 items-start
                  ${isActive
                    ? "bg-primary/10 border-l-[3px] border-l-primary"
                    : "border-l-[3px] border-l-transparent hover:bg-surface-muted/60"
                  }`}
              >
                {/* avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 mt-0.5"
                  style={{ background: avatarColor(driverLabel) }}
                >
                  {initials(driverLabel)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* row 1: unread dot + driver name + date */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {r.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    <span className={`text-[13px] truncate flex-1 text-text-primary ${r.unread ? "font-bold" : "font-semibold"}`}>
                      {driverLabel}
                    </span>
                    <span className="text-[11px] text-text-tertiary shrink-0">
                      {fmtDate(r.submittedAt).split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>

                  {/* row 2: stars + trip + flagged badge */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <StarRow rating={r.rating} size={11} />
                    <span className="text-[11px] text-text-tertiary">·</span>
                    <span className="text-[11px] text-text-tertiary truncate flex-1">
                      {r.pickupName.split(",")[0]} → {r.dropName.split(",")[0]}
                    </span>
                    {r.flagged && (
                      <span className="shrink-0 bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Flag size={8} className="fill-current" />
                        FLAGGED
                      </span>
                    )}
                  </div>

                  {/* row 3: subject */}
                  <div className={`text-[12px] truncate mb-0.5 text-text-secondary ${r.unread ? "font-semibold" : "font-medium"}`}>
                    {r.pickupName} → {r.dropName}
                  </div>

                  {/* row 4: from rider */}
                  <div className="text-[12px] text-text-tertiary truncate">
                    from {r.customerName} · {r.pickupName.split(",")[0]} → {r.dropName.split(",")[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── Detail panel ──────────────────────────────────────────────────── */}
      {selected ? (
        <Card className="h-full overflow-hidden flex flex-col">
          {/* header actions */}
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 shrink-0 flex-wrap">
            <span className="text-[12px] text-text-tertiary">Review ID</span>
            <span className="text-[12px] font-bold text-text-primary font-mono truncate max-w-[160px]">{selected.id}</span>
            <div className="flex-1" />
            <button
              onClick={() => flagMutation.mutate(selected.id)}
              disabled={flagMutation.isPending}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors
                ${selected.flagged
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-surface text-text-secondary border-border hover:border-red-300 hover:text-red-600"
                }`}
            >
              <Flag size={12} className={selected.flagged ? "fill-current" : ""} />
              {selected.flagged ? "Flagged" : "Flag"}
            </button>
            <button
              onClick={() => toast.success("Review archived")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border border-border bg-surface text-text-secondary hover:bg-surface-muted transition-colors"
            >
              <Archive size={12} />
              Archive
            </button>
            <button
              onClick={() => toast.success("Forwarded to driver")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border border-border bg-surface text-text-secondary hover:bg-surface-muted transition-colors"
            >
              <Forward size={12} />
              Forward
            </button>
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
            {/* Subject + driver */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-3 leading-tight">
                {selected.pickupName} → {selected.dropName}
              </h2>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[15px] font-bold shrink-0"
                  style={{ background: avatarColor(selected.driverName ?? "?") }}
                >
                  {initials(selected.driverName ?? "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] text-text-primary">
                    {selected.driverName ?? "No driver assigned"}
                    {selected.vehicleNumber && (
                      <span className="ml-1.5 text-[12px] font-normal text-text-tertiary">· {selected.vehicleNumber}</span>
                    )}
                  </div>
                  <div className="text-[12px] text-text-tertiary mt-0.5">
                    Reviewed by{" "}
                    <strong className="text-text-secondary font-semibold">{selected.customerName}</strong>
                    {" "}· {fmtDateTime(selected.submittedAt)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <StarRow rating={selected.rating} size={18} />
                  <div className="mt-1.5">
                    <Chip size="sm" color={RATING_COLOR[selected.rating]} variant="soft">
                      {RATING_LABEL[selected.rating]}
                    </Chip>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rider comment */}
            {selected.comment ? (
              <div
                className="bg-surface-muted border border-border rounded-lg p-4"
                style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-primary)" }}
              >
                <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-2">Rider Comment</p>
                <p className="text-[14px] text-text-primary leading-relaxed">"{selected.comment}"</p>
              </div>
            ) : (
              <p className="text-sm text-text-tertiary italic">No comment left.</p>
            )}

            {/* Aspects + Trip details */}
            <div className="grid grid-cols-2 gap-3">
              {/* Aspect breakdown */}
              <div className="border border-border rounded-xl p-3.5">
                <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-3">Aspect Breakdown</p>
                {([
                  { label: "Punctuality", value: selected.ratingPunctuality },
                  { label: "Cleanliness", value: selected.ratingCleanliness },
                  { label: "Behavior",    value: selected.ratingBehavior    },
                  { label: "Driving",     value: selected.ratingDriving     },
                ] as { label: string; value: number | null }[]).map(({ label, value }) => (
                  <AspectBar
                    key={label}
                    label={label}
                    value={value ?? selected.rating}
                    isFallback={value === null}
                  />
                ))}
              </div>

              {/* Trip details */}
              <div className="border border-border rounded-xl p-3.5">
                <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-3">Trip Details</p>
                <div className="flex items-center gap-2 mb-3 text-[12px]">
                  <span className="text-text-tertiary w-14 shrink-0">Trip ID</span>
                  <Link
                    href={`/admin/bookings/${selected.bookingId}`}
                    className="text-primary font-bold hover:underline underline-offset-2 font-mono truncate flex items-center gap-1"
                  >
                    {selected.bookingRef}
                    <ExternalLink size={10} />
                  </Link>
                </div>
                {/* Route */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-[12px]">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-text-secondary truncate">{selected.pickupName}</span>
                  </div>
                  <div className="border-l border-dashed border-border h-2 ml-[3px]" />
                  <div className="flex items-center gap-2 text-[12px]">
                    <div className="w-2 h-2 rounded bg-red-500 shrink-0" />
                    <span className="text-text-secondary truncate">{selected.dropName}</span>
                  </div>
                </div>
                <Separator className="mb-2.5" />
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <p className="text-[10px] text-text-tertiary font-bold uppercase">Distance</p>
                    <p className="text-[13px] font-bold text-text-primary">
                      {selected.distanceKm ? `${selected.distanceKm} km` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-tertiary font-bold uppercase">Fare</p>
                    <p className="text-[13px] font-bold text-text-primary">
                      {selected.totalFare
                        ? `₹${parseFloat(selected.totalFare).toLocaleString("en-IN")}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-tertiary font-bold uppercase">Vehicle</p>
                    <p className="text-[11px] font-semibold text-text-primary truncate capitalize">
                      {selected.vehicleType
                        ? `${selected.vehicleType}${selected.ac ? " AC" : ""}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reply box */}
            {!replyOpen ? (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setReplyOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-[13px] font-bold hover:opacity-90 transition-opacity"
                >
                  <Send size={13} />
                  Reply to {selected.customerName.split(" ")[0]}
                </button>
                <Link
                  href={`/admin/bookings/${selected.bookingId}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-[13px] font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
                >
                  <Car size={13} />
                  View trip {selected.bookingRef}
                </Link>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-surface-muted px-3.5 py-2.5 border-b border-border text-[12px] text-text-secondary">
                  Replying to{" "}
                  <strong className="text-text-primary">{selected.customerName}</strong>{" "}
                  regarding trip{" "}
                  <strong className="text-primary">{selected.bookingRef}</strong>
                </div>
                <textarea
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply…"
                  className="w-full min-h-[100px] border-none outline-none px-4 py-3.5 text-[13px] text-text-primary bg-surface resize-none"
                />
                <div className="px-3.5 py-2.5 border-t border-border flex items-center gap-2">
                  <button
                    onClick={() => {
                      toast.success("Reply sent");
                      setReplyOpen(false);
                      setReplyText("");
                    }}
                    className="flex items-center gap-1.5 bg-primary text-white rounded-lg px-4 py-2 text-[12px] font-bold"
                  >
                    <Send size={11} />
                    Send reply
                  </button>
                  <button
                    onClick={() => { setReplyOpen(false); setReplyText(""); }}
                    className="flex items-center gap-1 text-text-tertiary px-3 py-2 text-[12px] font-semibold rounded-lg hover:bg-surface-muted"
                  >
                    <X size={12} />
                    Cancel
                  </button>
                  <div className="flex-1" />
                  <span className="text-[11px] text-text-tertiary">Sent via Mohan Cabs · SMS</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="h-full flex items-center justify-center">
          <p className="text-sm text-text-tertiary">Select a review to read</p>
        </Card>
      )}
    </div>
  );
}

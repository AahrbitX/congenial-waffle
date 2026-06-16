import { request } from "@/lib/api-client";
import { initials } from "@/lib/dashboard/helpers";
import { Review } from "@/types/reviews.types";
import { avatarColor } from "@/utils/avatarColor";
import { dateParser } from "@/utils/DateParser";
import { StarRow } from "@/utils/starRow";
import { Button, Card, Chip, Meter, Separator, toast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, Flag, Forward } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ReviewDetailProps {
  review: Review;
}

const ReviewDetail: React.FC<ReviewDetailProps> = (props) => {
  const { review } = props;
  const qc = useQueryClient();

  const flagMutation = useMutation({
    mutationFn: (id: string) =>
      request(`/api/reviews/${id}/flag`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
    onError: () => toast.danger("Could not update flag"),
  });

  const RATING_COLOR: Record<
    number,
    "success" | "accent" | "warning" | "danger"
  > = {
    5: "success",
    4: "success",
    3: "accent",
    2: "warning",
    1: "danger",
  };

  const RATING_LABEL: Record<number, string> = {
    5: "Excellent",
    4: "Great",
    3: "Good",
    2: "Fair",
    1: "Poor",
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      {/* header actions */}
      <div className="pb-2 flex items-center gap-2 shrink-0 flex-wrap">
        <span className="text-sm text-muted">Booking ID</span>
        <span className="text-sm font-semibold text-primary font-mono">
          {review.bookingRef}
        </span>
        <div className="flex-1" />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => flagMutation.mutate(review.id)}
          isDisabled={flagMutation.isPending}
        >
          <Flag size={12} className={review.flagged ? "fill-current" : ""} />
          {review.flagged ? "Flagged" : "Flag"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => toast.success("Review archived")}
        >
          <Archive size={12} />
          Archive
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => toast.success("Forwarded to driver")}
        >
          <Forward size={12} />
          Forward
        </Button>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
        {/* Subject + driver */}
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-3 leading-tight">
            {review.pickupLocation} → {review.dropLocation}
          </h2>
          <div className="flex items-center gap-3">
            <div
              className="size-9 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{
                background: avatarColor(review.driverName ?? "?"),
              }}
            >
              {initials(review.driverName ?? "?")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-text-primary">
                {review.driverName ?? "No driver assigned"}
                {review.vehicleNumber && (
                  <span className="ml-1.5 text-xs font-semibold text-muted">
                    · {review.vehicleNumber}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted mt-0.5">
                Reviewed by{" "}
                <strong className="text-text-secondary font-semibold">
                  {review.customerName}
                </strong>{" "}
                · {dateParser(review.submittedAt)}
              </div>
            </div>
            <div className="text-right shrink-0">
              <StarRow rating={review.rating} size={18} />
              <div className="mt-1.5">
                <Chip
                  size="sm"
                  color={RATING_COLOR[review.rating]}
                  variant="soft"
                >
                  {RATING_LABEL[review.rating]}
                </Chip>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Rider comment */}
        {review.comment ? (
          <div
            className="bg-surface-muted border border-border rounded-lg p-4"
            style={{
              borderLeftWidth: 3,
              borderLeftColor: "var(--color-primary)",
            }}
          >
            <p className="font-semibold text-sm mb-2">Rider Comment</p>
            <p className="text-[14px] text-text-primary leading-relaxed">
              &quot;{review.comment}&quot;
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted italic">No comment left.</p>
        )}

        {/* Aspects + Trip details */}
        <div className="grid grid-cols-2 gap-3">
          {/* Aspect breakdown */}
          <div className="border border-border rounded-2xl p-4">
            <p className="text-sm font-semibold mb-2">Aspect Breakdown</p>
            {(
              [
                { label: "Punctuality", value: review.ratingPunctuality },
                { label: "Cleanliness", value: review.ratingCleanliness },
                { label: "Behavior", value: review.ratingBehavior },
                { label: "Driving", value: review.ratingDriving },
              ] as { label: string; value: number | null }[]
            ).map(({ label, value }) => (
              <AspectBar
                key={label}
                label={label}
                value={value ?? review.rating}
                isFallback={value === null}
              />
            ))}
          </div>

          {/* Trip details */}
          <div className="border border-border rounded-2xl p-4">
            <p className="text-sm font-semibold mb-2">Trip Details</p>
            <div className="flex items-center mb-2 text-sm">
              <span className="text-muted w-14 shrink-0">Trip ID</span>
              <Link
                href={`/admin/bookings/${review.bookingId}`}
                className="text-primary font-bold hover:underline underline-offset-2 font-mono truncate flex items-center gap-1"
              >
                {review.bookingRef}
              </Link>
            </div>
            {/* Route */}
            <div className="space-y-1 mb-3">
              <div className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="">{review.pickupLocation}</span>
              </div>
              <div className="border-l border-dashed border-border h-2 ml-[3px]" />
              <div className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 mt-2  rounded bg-red-500 shrink-0" />
                <span className="">{review.dropLocation}</span>
              </div>
            </div>
            <Separator className="mb-4" />
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <p className="text-xs text-muted">Distance</p>
                <p className="text-sm font-bold text-text-primary">
                  {review.distanceKm ? `${review.distanceKm} km` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Fare</p>
                <p className="text-sm font-bold text-text-primary">
                  {review.totalFare
                    ? `₹${parseFloat(review.totalFare).toLocaleString("en-IN")}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Vehicle</p>
                <p className="text-sm font-semibold text-text-primary truncate capitalize">
                  {review.vehicleType
                    ? `${review.vehicleType}${review.ac ? " AC" : ""}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="flex gap-2 flex-wrap">
              <Link
                href={`/admin/bookings/${selected.bookingId}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-[13px] font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
              >
                <Car size={13} />
                View trip {selected.bookingRef}
              </Link>
            </div> */}
      </div>
    </Card>
  );
};

function AspectBar({
  label,
  value,
  isFallback,
}: {
  label: string;
  value: number;
  isFallback?: boolean;
}) {
  const meterValue = (value / 5) * 100;

  const color = isFallback
    ? "accent"
    : value >= 4
      ? "success"
      : value === 3
        ? "warning"
        : "danger";

  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="text-sm text-text-secondary w-20 shrink-0">{label}</span>

      <Meter
        value={isFallback ? 0 : meterValue}
        color={color}
        className="flex-1"
      >
        <Meter.Track className="h-1.5 bg-surface-muted">
          <Meter.Fill />
        </Meter.Track>
      </Meter>

      <span
        className={`text-sm font-bold w-8 text-right ${
          isFallback ? "text-muted" : "text-text-primary"
        }`}
      >
        {isFallback ? "—" : value.toFixed(1)}
      </span>
    </div>
  );
}

export default ReviewDetail;

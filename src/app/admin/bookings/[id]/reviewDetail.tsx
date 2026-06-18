import React, { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, ExternalLink, Copy, Check } from "lucide-react";

import { Card, Separator, toast } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { IconStar } from "@/constants/icons";
import { request } from "@/lib/api-client";

type ReviewDetailsProps = {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    submittedAt: string | null;
  } | null;
  bookingId?: string;
  bookingStatus?: string;
  qrToken?: string | null;
};

function ReviewDetails({ review, bookingId, bookingStatus, qrToken }: ReviewDetailsProps) {
  const [copied, setCopied] = useState(false);
  const reviewLink = review
    ? `/admin/reviews?reviewId=${review.id}`
    : `/admin/reviews`;

  const publicReviewUrl = qrToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/review/${qrToken}`
    : null;

  const requestReviewMutation = useMutation({
    mutationFn: () =>
      request(`/api/bookings/${bookingId}/request-review`, { method: "POST" }),
    onSuccess: () => toast.success("Review request sent via WhatsApp"),
    onError: (err: any) =>
      toast(err?.message ?? "Failed to send review request", { variant: "danger" }),
  });

  const canRequestReview = bookingStatus === "completed" && !review && bookingId;

  return (
    <Card className="gap-2">
      <Card.Header className="flex flex-row items-center justify-between">
        <Card.Title>Review</Card.Title>
        <Link
          href={reviewLink}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80 no-underline"
        >
          View Review
        </Link>
      </Card.Header>

      {review ? (
        <div className="space-y-2 px-1 pb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <IconStar
                key={s}
                size={18}
                className={
                  s <= review.rating
                    ? "text-warning fill-warning"
                    : "text-default-200"
                }
              />
            ))}
            <span className="ml-1 text-sm font-bold text-foreground">
              {review.rating}/5
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-default-600 leading-relaxed">
              &quot;{review.comment}&quot;
            </p>
          )}
          {review.submittedAt && (
            <p className="text-xs text-default-400">
              {new Date(review.submittedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      ) : (
        <div className="px-1 pb-3 space-y-3">
          <p className="text-sm text-default-400">No review submitted yet.</p>

          {canRequestReview && (
            <>
              <Separator />
              {publicReviewUrl && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide">Review Link</p>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2">
                    <p className="flex-1 text-xs text-text-secondary truncate font-mono">{publicReviewUrl}</p>
                    <a href={publicReviewUrl} target="_blank" rel="noreferrer">
                      <Button isIconOnly size="sm" variant="ghost"><ExternalLink size={13} /></Button>
                    </a>
                    <Button
                      isIconOnly size="sm" variant="ghost"
                      onPress={() => { navigator.clipboard.writeText(publicReviewUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    >
                      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </Button>
                  </div>
                </div>
              )}
              <Button
                size="sm"
                variant="secondary"
                fullWidth
                isLoading={requestReviewMutation.isPending}
                onPress={() => requestReviewMutation.mutate()}
              >
                <MessageSquare size={14} />
                Request Review via WhatsApp
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

export default ReviewDetails;

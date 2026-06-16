import React from "react";
import Link from "next/link";

import { Card } from "@heroui/react";
import { IconStar } from "@/constants/icons";

type ReviewDetailsProps = {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    submittedAt: string | null;
  } | null;
};

function ReviewDetails({ review }: ReviewDetailsProps) {
  const reviewLink = review
    ? `/admin/reviews?reviewId=${review.id}`
    : `/admin/reviews`;

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
        <div className="space-y-2 px-1 pb-1">
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
        <p className="text-sm text-default-400 px-1 pb-2">
          No review submitted yet.
        </p>
      )}
    </Card>
  );
}

export default ReviewDetails;

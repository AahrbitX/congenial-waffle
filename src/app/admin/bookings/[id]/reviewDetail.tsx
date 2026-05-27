import React from "react";
import { Card } from "@heroui/react";
import { IconStar } from "@/constants/icons";

type ReviewDetailsProps = {
  review: {
    rating: number;
    comment: string | null;
    submittedAt: string | null;
  } | null;
};

function ReviewDetails({ review }: ReviewDetailsProps) {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Card.Title>Review</Card.Title>
      </Card.Header>
      {review ? (
        <div className="space-y-2 px-1 pb-1">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <IconStar
                key={s}
                size={18}
                className={s <= review.rating ? "text-warning fill-warning" : "text-default-200"}
              />
            ))}
            <span className="ml-1 text-sm font-bold text-foreground">{review.rating}/5</span>
          </div>
          {review.comment && (
            <p className="text-sm text-default-600 leading-relaxed">"{review.comment}"</p>
          )}
          {review.submittedAt && (
            <p className="text-xs text-default-400">
              {new Date(review.submittedAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-default-400 px-1 pb-2">No review submitted yet.</p>
      )}
    </Card>
  );
}

export default ReviewDetails;

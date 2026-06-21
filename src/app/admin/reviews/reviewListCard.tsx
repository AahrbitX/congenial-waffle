import React from "react";
import { Flag } from "lucide-react";

import { Review } from "@/types/reviews.types";
import { dateParser } from "@/utils/DateParser";
import { initials } from "@/lib/dashboard/helpers";
import { avatarColor } from "@/utils/avatarColor";
import { StarRow } from "@/utils/starRow";

interface ReviewListCardProps {
  review: Review;
  isActive: boolean;
  selectReview: (id: Review) => void;
}

const ReviewListCard: React.FC<ReviewListCardProps> = (prop) => {
  const { review, isActive, selectReview } = prop;
  const driverLabel = review.driverName ?? "No driver";

  return (
    <button
      key={review.id}
      onClick={() => selectReview(review)}
      className={`w-full text-left px-4 py-3.5 border-b border-border/50 transition-colors flex gap-3 items-start ${isActive ? "bg-primary/10 border-l-[3px] border-l-primary" : "border-l-[3px] border-l-transparent hover:bg-surface-muted/60"}`}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 mt-0.5"
        style={{ background: avatarColor(driverLabel) }}
      >
        {initials(driverLabel)}
      </div>

      <div className="flex-1 min-w-0">
        {/* row 1: unread dot + driver name + date */}
        <div className="flex items-center gap-1.5 mb-0.5">
          {review.unread && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
          <span className={"text-base mb-0 truncate flex-1 font-semibold "}>
            {driverLabel}
          </span>
          <span className="text-xs text-muted shrink-0">
            {dateParser(review.submittedAt)}
          </span>
        </div>

        {/* row 2: stars + trip + flagged badge */}
        <div className="flex items-center gap-1.5 mb-1">
          <StarRow rating={review.rating} size={11} />
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted truncate flex-1">
            {review.pickupLocation.split(",")[0]} →{" "}
            {review.dropLocation.split(",")[0]}
          </span>
          {review.flagged && (
            <span className="shrink-0 bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <Flag size={8} className="fill-current" />
              FLAGGED
            </span>
          )}
        </div>

        {/* row 3: subject */}
        <div
          className={`text-sm truncate mb-0.5 text-text-secondary ${review.unread ? "font-semibold" : "font-medium"}`}
        >
          {review.comment || "No comments"}
        </div>

        {/* row 4: from rider */}
        <div className="text-xs text-muted truncate">
          from {review.customerName} for {review.bookingRef}
        </div>
      </div>
    </button>
  );
};

export default ReviewListCard;

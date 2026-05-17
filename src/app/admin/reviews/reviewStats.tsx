"use client";

import React from "react";
import { Card, Label, Meter } from "@heroui/react";
import { Star } from "lucide-react";

const reviews = [
  { rating: 5, count: 5 },
  { rating: 4, count: 3 },
  { rating: 3, count: 2 },
  { rating: 2, count: 1 },
  { rating: 1, count: 1 },
];

const totalReviews = reviews.reduce((acc, review) => acc + review.count, 0);

const averageRating =
  reviews.reduce((acc, review) => acc + review.rating * review.count, 0) /
  totalReviews;

function ReviewStats() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
      {/* Overall Rating */}
      <Card>
        <Card.Title>Overall Rating</Card.Title>
        <Card.Content>
          <div>
            <div className="flex items-end gap-1">
              <h2 className="text-4xl font-bold">{averageRating.toFixed(2)}</h2>
              <span className="pb-1 text-sm text-muted">/ 5.00</span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 text-orange-500">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={16}
                fill={
                  index < Math.round(averageRating) ? "currentColor" : "none"
                }
              />
            ))}
          </div>
        </Card.Content>
        <Card.Footer className="text-sm text-muted">
          Based on recent customer feedback
        </Card.Footer>
      </Card>

      {/* Star Distribution */}
      <Card className="lg:col-span-2">
        <Card.Title className="">Star Distribution</Card.Title>
        <Card.Content>
          <div className="space-y-0.5">
            {reviews.map((review) => {
              const percentage = (review.count / totalReviews) * 100;
              return (
                <div
                  key={review.rating}
                  className="grid grid-cols-[16px_16px_1fr_20px] items-center gap-3"
                >
                  <Label className="text-sm font-medium">{review.rating}</Label>
                  <Star size={12} className="fill-accent text-accent" />
                  <Meter
                    aria-label={`${review.rating} star reviews`}
                    value={percentage}
                    className="w-full"
                  >
                    <Meter.Track>
                      <Meter.Fill />
                    </Meter.Track>
                  </Meter>
                  <span className="text-sm text-muted">{review.count}</span>
                </div>
              );
            })}
          </div>
        </Card.Content>
      </Card>

      {/* Total Reviews */}
      <Card>
        <Card.Title className="">Total Reviews</Card.Title>
        <Card.Content className="">
          <div>
            <h2 className=" text-5xl font-bold">{totalReviews}</h2>
          </div>
        </Card.Content>
        <Card.Footer className="text-sm text-muted">
          Collected in the last 30 days
        </Card.Footer>
      </Card>

      {/* Unread */}
      <Card>
        <Card.Title className="">Unread</Card.Title>
        <Card.Content className="">
          <div>
            <h2 className="text-5xl font-bold">0</h2>
          </div>
        </Card.Content>
        <Card.Footer className="text-sm text-muted">
          Reviews awaiting admin response
        </Card.Footer>
      </Card>

      {/* Flagged */}
      <Card>
        <Card.Title className="">Flagged</Card.Title>
        <Card.Content className="">
          <div>
            <h2 className="text-5xl font-bold text-danger">2</h2>
          </div>
        </Card.Content>
        <Card.Footer className="text-sm text-muted">
          Marked for quality verification
        </Card.Footer>
      </Card>
    </div>
  );
}

export default ReviewStats;

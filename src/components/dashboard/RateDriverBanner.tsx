"use client";

import { Card, Avatar, Button } from "@heroui/react";
import { IconStar, IconArrowRight } from "@/constants/icons";
import type { Ride } from "@/types/ride.types";

interface RateDriverBannerProps {
  ride: Ride;
  onRate: (ride: Ride) => void;
}

export function RateDriverBanner({ ride, onRate }: RateDriverBannerProps) {
  return (
    <Card className="border border-warning/30 bg-warning/5">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/10">
          <IconStar size={16} className="text-warning" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">Rate your recent ride</p>
          <p className="text-xs text-text-tertiary truncate">
            {ride.from} → {ride.to}
            {ride.driver ? ` · ${ride.driver}` : ""}
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onPress={() => onRate(ride)}
          className="shrink-0"
        >
          Rate Now
          <IconArrowRight size={13} />
        </Button>
      </div>
    </Card>
  );
}

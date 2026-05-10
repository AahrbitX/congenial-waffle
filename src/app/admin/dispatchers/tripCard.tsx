// tripCard.tsx
import React from "react";
import { cn, Chip, Skeleton } from "@heroui/react";
import { Circle, Square } from "lucide-react";
import UserAvatar from "@/components/user/avatar";

interface TripCardProps {
  trip: any;
  isActive?: boolean;
  onSelect: (id: string) => void;
}

export default function TripCard({ trip, isActive, onSelect }: TripCardProps) {
  return (
    <div
      onClick={() => onSelect(trip.id)}
      className={cn(
        "relative cursor-pointer border-b border-divider p-3 transition-all hover:bg-default-50",
        isActive ? "bg-accent/10" : "bg-transparent",
      )}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-0 h-full w-1 bg-accent" />
      )}

      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold tracking-tight">{trip.id}</span>
          <Chip
            size="sm"
            variant="soft"
            color="danger"
            className="text-[12px] uppercase font-bold h-6"
          >
            {trip.status}
          </Chip>
        </div>

        {/* Customer & Badges */}
        <div className="flex items-center gap-2">
          <UserAvatar username={trip.customerName} size="sm" />
          <span className="text-sm font-medium text-default-700">
            {trip.customerName}
          </span>
        </div>

        <div className="flex gap-1.5">
          <Chip size="sm" variant="primary" className="h-5 text-[12px] px-2">
            {trip.vehicleType}
          </Chip>
          <Chip size="sm" variant="primary" className="h-5 text-[12px] px-2">
            {trip.ac ? "AC" : "Non-AC"}
          </Chip>
          <Chip size="sm" variant="primary" className="h-5 text-[12px] px-2">
            {trip.seats} seats
          </Chip>
        </div>

        {/* Timeline Locations */}
        <div className="space-y-1 mt-1">
          <div className="flex items-center gap-2">
            <Circle size={14} fill="var(--accent)" className="text-accent" />
            <span className="text-xs text-default-600 truncate">
              {trip.pickupName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Square
              size={12}
              fill="black"
              className="text-default-900 fill-default-900 shrink-0 ml-[1px]"
            />
            <span className="text-xs text-default-600 truncate">
              {trip.dropName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="border-b border-divider p-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-full rounded-md" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-sm" />
            <Skeleton className="h-3 w-5/6 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

// tripCard.tsx
import React from "react";
import { cn, Chip, Avatar } from "@heroui/react";
import { Circle, CircleDot, Square } from "lucide-react";

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
          <Avatar color="accent" variant="soft" size="sm">
            <Avatar.Fallback className="text-xs">DF</Avatar.Fallback>
          </Avatar>
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
              {trip.pickup}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Square
              size={12}
              fill="black"
              className="text-default-900 fill-default-900 shrink-0 ml-[1px]"
            />
            <span className="text-xs text-default-600 truncate">
              {trip.drop}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

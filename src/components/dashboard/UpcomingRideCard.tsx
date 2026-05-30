"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, Chip, Avatar, Separator, Button } from "@heroui/react";
import {
  IconCar,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconArrowRight,
  IconEye,
  IconXCircle,
} from "@/constants/icons";
import { useCancelRide } from "@/hooks/useRides";
import type { Ride } from "@/types/ride.types";

interface UpcomingRideCardProps {
  ride: Ride;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
}

export function UpcomingRideCard({ ride }: UpcomingRideCardProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelRide = useCancelRide();

  // A ride is only truly "confirmed" when a driver has been assigned
  const hasDriver = !!ride.driver;
  const statusLabel = hasDriver ? "Confirmed" : "Pending";
  const statusColor = hasDriver ? "success" : "warning";

  const handleCancel = async () => {
    await cancelRide.mutateAsync(ride.id);
    setConfirmCancel(false);
  };

  return (
    <Card className="overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between bg-primary/8 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <IconCar size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-text-primary leading-tight">Upcoming Ride</p>
            <p className="text-[11px] text-text-tertiary">#{ride.bookingRef}</p>
          </div>
        </div>
        <Chip color={statusColor} variant="soft" size="sm" className="text-[11px] font-semibold">
          {statusLabel}
        </Chip>
      </div>

      <div className="p-4 space-y-3">
        {/* Route */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2.5">
          <IconMapPin size={13} className="shrink-0 text-primary" />
          <span className="flex-1 truncate text-sm font-semibold text-text-primary">{ride.from}</span>
          <IconArrowRight size={12} className="shrink-0 text-text-tertiary" />
          <span className="flex-1 truncate text-sm font-semibold text-text-primary text-right">{ride.to}</span>
        </div>

        {/* Journey details grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface-muted py-2.5 px-2">
            <IconCalendar size={14} className="text-primary" />
            <p className="text-[11px] font-semibold text-text-primary text-center leading-tight">
              {formatDate(ride.journeyDate)}
            </p>
            <p className="text-[10px] text-text-tertiary">Date</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface-muted py-2.5 px-2">
            <IconClock size={14} className="text-primary" />
            <p className="text-[13px] font-bold text-text-primary">{formatTime(ride.journeyTime)}</p>
            <p className="text-[10px] text-text-tertiary">Time</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface-muted py-2.5 px-2">
            <IconCar size={14} className="text-primary" />
            <p className="text-[13px] font-bold text-text-primary">{capitalize(ride.vehicleType)}</p>
            <p className="text-[10px] text-text-tertiary">Vehicle</p>
          </div>
        </div>

        {/* Driver row (if assigned) */}
        {ride.driver && (
          <>
            <Separator />
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <Avatar.Fallback className="text-xs">
                  {ride.driver.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </Avatar.Fallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{ride.driver}</p>
                <p className="text-xs text-text-tertiary">{ride.driverPhone || "Driver assigned"}</p>
              </div>
              <p className="text-lg font-black text-primary shrink-0">
                ₹{ride.fare.toLocaleString("en-IN")}
              </p>
            </div>
          </>
        )}

        {/* Fare only (no driver yet) */}
        {!ride.driver && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-tertiary">Estimated Fare</p>
            <p className="text-lg font-black text-primary">₹{ride.fare.toLocaleString("en-IN")}</p>
          </div>
        )}

        <Separator />

        {/* Action buttons */}
        {confirmCancel ? (
          <div className="rounded-xl border border-danger/20 bg-danger/5 p-3 space-y-2">
            <p className="text-sm font-semibold text-text-primary">Cancel this ride?</p>
            <p className="text-xs text-text-tertiary">This action cannot be undone.</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onPress={() => setConfirmCancel(false)}
              >
                Keep Ride
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="flex-1"
                onPress={handleCancel}
                isDisabled={cancelRide.isPending}
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger-soft"
              className="flex-1"
              onPress={() => setConfirmCancel(true)}
            >
              <IconXCircle size={14} />
              Cancel Ride
            </Button>

            <Link href={`/dashboard/rides/${ride.id}`} className="flex-1">
              <Button size="sm" variant="secondary" className="w-full">
                <IconEye size={14} />
                View Details
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

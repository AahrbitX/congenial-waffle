"use client";

import { Avatar } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { useDashboard } from "@/context/DashboardContext";
import { initials } from "@/lib/dashboard/helpers";
import { IconX, IconMapPin, IconPhone, IconStar } from "@/constants/icons";
import type { Ride } from "@/types/ride.types";

interface RideDetailPanelProps {
  ride: Ride;
  onClose: () => void;
}

export function RideDetailPanel({ ride, onClose }: RideDetailPanelProps) {
  const { openRatingModal } = useDashboard();

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden sticky top-0">
      <div className="bg-[var(--color-surface-muted)] px-5 py-4 flex items-start justify-between">
        <div>
          <p className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
            Trip Detail · {ride.id}
          </p>
          <p className="text-[14px] font-black text-primary mt-0.5">
            {ride.date}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--color-border)]"
        >
          <IconX size={14} />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-primary)] shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                PICKUP
              </p>
              <p className="text-[13px] font-semibold text-primary">
                {ride.from}
              </p>
            </div>
          </div>
          <div className="ml-[4px] w-px h-4 bg-[var(--color-border-strong)]" />
          <div className="flex items-start gap-3">
            <IconMapPin
              size={10}
              className="text-[var(--color-primary)] mt-1 shrink-0"
            />
            <div>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                DROP-OFF
              </p>
              <p className="text-[13px] font-semibold text-primary">
                {ride.to}
              </p>
            </div>
          </div>
        </div>
        <MapPlaceholder height={120} />
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Distance", value: ride.distance },
            { label: "Duration", value: ride.duration },
            { label: "Payment", value: ride.payment },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[var(--color-surface-muted)] rounded-xl px-2 py-2.5 text-center"
            >
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                {label}
              </p>
              <p className="text-[12px] font-bold text-primary">{value}</p>
            </div>
          ))}
        </div>
        {ride.driver !== "—" && (
          <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-muted)] rounded-xl">
            <Avatar size="sm">
              <Avatar.Fallback className="bg-[var(--color-primary)] text-white font-bold text-[12px]">
                {initials(ride.driver)}
              </Avatar.Fallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-primary">
                {ride.driver}
              </p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">
                {ride.vehicle} · {ride.plate}
              </p>
            </div>
            <a
              href={`tel:${ride.driverPhone}`}
              className="w-8 h-8 rounded-full bg-[var(--color-surface)] shadow-sm flex items-center justify-center hover:bg-[var(--color-primary-light)] transition-colors"
            >
              <IconPhone size={13} className="text-[var(--color-primary)]" />
            </a>
          </div>
        )}
        <div className="space-y-1.5 text-[13px]">
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>Base fare</span>
            <span>₹{Math.max(0, ride.fare - ride.tip)}</span>
          </div>
          {ride.tip > 0 && (
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Tip</span>
              <span>₹{ride.tip}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-primary border-t border-[var(--color-border)] pt-1.5">
            <span>Total</span>
            <span>₹{ride.fare}</span>
          </div>
        </div>
        {ride.status === "completed" && (
          <Button
            onPress={() => openRatingModal(ride)}
            className="w-full bg-[var(--color-primary)] text-white font-bold rounded-xl"
          >
            <IconStar size={14} className="mr-1.5" /> Rate this Ride
          </Button>
        )}
      </div>
    </div>
  );
}

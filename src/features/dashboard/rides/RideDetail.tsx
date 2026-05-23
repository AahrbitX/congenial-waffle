"use client";

import Link from "next/link";
import { Avatar } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDashboard } from "@/context/DashboardContext";
import { useRide } from "@/hooks/useRides";
import { initials } from "@/lib/dashboard/helpers";
import {
  IconArrowLeft,
  IconMapPin,
  IconPhone,
  IconStar,
  IconLoader,
  IconCar,
} from "@/constants/icons";
import { ROUTES } from "@/constants/routes";

interface RideDetailProps {
  id: string;
}

export function RideDetail({ id }: RideDetailProps) {
  const { data: ride, isLoading } = useRide(id);
  const { openRatingModal } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <IconLoader
          size={28}
          className="animate-spin text-[var(--color-primary)]"
        />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <IconCar size={48} className="text-[var(--color-border-strong)]" />
        <p className="text-[16px] font-bold text-[var(--color-text-secondary)]">
          Ride not found
        </p>
        <Link
          href={ROUTES.dashboard.rides}
          className="text-[var(--color-primary)] text-[14px] font-semibold hover:underline"
        >
          ← Back to Ride History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back nav */}
      <Link
        href={ROUTES.dashboard.rides}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:text-primary transition-colors"
      >
        <IconArrowLeft size={14} /> Back to Ride History
      </Link>

      {/* Header */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wide">
              Trip · {ride.id}
            </p>
            <p className="text-[20px] font-black text-primary mt-1 tracking-tight">
              {ride.from} → {ride.to}
            </p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">
              {ride.date}
            </p>
          </div>
          <StatusBadge status={ride.status} />
        </div>
      </div>

      {/* Route */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-3">
        <p className="text-[12px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">
          Route
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-primary)] shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                PICKUP
              </p>
              <p className="text-[14px] font-semibold text-primary">
                {ride.from}
              </p>
            </div>
          </div>
          <div className="ml-[4px] w-px h-5 bg-[var(--color-border-strong)]" />
          <div className="flex items-start gap-3">
            <IconMapPin
              size={10}
              className="text-[var(--color-primary)] mt-1 shrink-0"
            />
            <div>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                DROP-OFF
              </p>
              <p className="text-[14px] font-semibold text-primary">
                {ride.to}
              </p>
            </div>
          </div>
        </div>
        <MapPlaceholder height={180} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Distance", value: ride.distance },
          { label: "Duration", value: ride.duration },
          { label: "Payment", value: ride.payment },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 text-center shadow-sm"
          >
            <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">
              {label}
            </p>
            <p className="text-[15px] font-black text-primary mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Driver */}
      {ride.driver !== "—" && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <p className="text-[12px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-3">
            Driver
          </p>
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <Avatar.Fallback className="bg-[var(--color-primary)] text-white font-bold text-[12px]">
                {initials(ride.driver)}
              </Avatar.Fallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-primary">
                {ride.driver}
              </p>
              <p className="text-[12px] text-[var(--color-text-tertiary)]">
                {ride.vehicle} · {ride.plate}
              </p>
            </div>
            <a
              href={`tel:${ride.driverPhone}`}
              className="w-9 h-9 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center hover:bg-[var(--color-primary-light)] transition-colors"
            >
              <IconPhone size={14} className="text-[var(--color-primary)]" />
            </a>
          </div>
        </div>
      )}

      {/* Fare breakdown */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
        <p className="text-[12px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-3">
          Fare Breakdown
        </p>
        <div className="space-y-2 text-[14px]">
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
          <div className="flex justify-between font-black text-primary border-t border-[var(--color-border)] pt-2">
            <span>Total</span>
            <span>₹{ride.fare}</span>
          </div>
        </div>
      </div>

      {/* Rating CTA */}
      {ride.status === "completed" && (
        <Button
          onPress={() => openRatingModal(ride)}
          className="w-full bg-[var(--color-primary)] text-white font-bold rounded-xl py-3.5"
        >
          <IconStar size={15} className="mr-2" /> Rate this Ride
        </Button>
      )}
    </div>
  );
}

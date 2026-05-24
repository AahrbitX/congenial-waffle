"use client";

import Link from "next/link";
import { Avatar, buttonVariants, Card } from "@heroui/react";
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
import { ArrowRight, ChevronLeft } from "lucide-react";

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
          <ChevronLeft size={16} /> Back to Ride History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back nav */}
      <Link
        href={ROUTES.dashboard.rides}
        className="text-sm text-muted flex items-center gap-2"
      >
        <ChevronLeft size={16} /> Back to Ride History
      </Link>

      {/* Header */}
      <Card className="">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted font-medium uppercase tracking-wide">
              Trip · {ride.id}
            </p>{" "}
            <StatusBadge status={ride.status} />
          </div>
          <p className="text-xl font-bold mt-1 flex items-center gap-x-1 flex-wrap">
            {ride.from} <ArrowRight size={18} /> {ride.to}
          </p>
          <p className="text-xs text-muted mt-1">{ride.date}</p>
        </div>
      </Card>

      {/* Route */}
      <Card className="">
        <Card.Header>
          <Card.Title>Route</Card.Title>
        </Card.Header>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 size-4 rounded-full border-2 border-primary shrink-0" />
            <div>
              <p className="text-xs text-muted">Pickup</p>
              <p className="text-base font-semibold text-primary">
                {ride.from}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <IconMapPin
              size={18}
              className="text-[var(--color-primary)] mt-1 shrink-0"
            />
            <div>
              <p className="text-xs text-muted">Drop-off</p>
              <p className="text-base font-semibold text-primary">{ride.to}</p>
            </div>
          </div>
        </div>
        <MapPlaceholder height={180} />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Distance", value: ride.distance },
          { label: "Duration", value: ride.duration },
          { label: "Payment", value: ride.payment },
        ].map(({ label, value }) => (
          <Card key={label} className="gap-1 text-center">
            <p className="text-xs text-muted">{label}</p>
            <p className="text-lg font-bold text-primary">{value}</p>
          </Card>
        ))}
      </div>

      {/* Driver */}
      {ride.driver !== "—" && (
        <Card className="">
          <Card.Header>
            <Card.Title>Driver Details</Card.Title>
          </Card.Header>
          <Card
            className="flex flex-row items-center gap-3"
            variant="secondary"
          >
            <Avatar size="sm">
              <Avatar.Fallback>{initials(ride.driver)}</Avatar.Fallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{ride.driver}</p>
              <p className="text-xs text-muted">
                {ride.vehicle} · {ride.plate}
              </p>
            </div>
            <Link
              href={`tel:${ride.driverPhone}`}
              className={
                buttonVariants({ variant: "primary", isIconOnly: true }) +
                " ml-auto"
              }
            >
              <IconPhone size={14} />
            </Link>
          </Card>
        </Card>
      )}

      {/* Fare breakdown */}
      <Card>
        <Card.Header>
          <Card.Title>Fare Breakdown</Card.Title>
        </Card.Header>
        <div className="space-y-2">
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>Base fare</span>
            <span>&#x20b9;{Math.max(0, ride.fare - ride.tip)}</span>
          </div>
          {ride.tip > 0 && (
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Tip</span>
              <span>&#x20b9;{ride.tip}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-primary border-t border-border pt-2">
            <span>Total</span>
            <span>&#x20b9;{ride.fare}</span>
          </div>
        </div>
      </Card>

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

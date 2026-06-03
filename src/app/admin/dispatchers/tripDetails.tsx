"use client";

import React, { useState } from "react";
import {
  Surface,
  Button,
  Avatar,
  Separator,
  Skeleton,
  buttonVariants,
} from "@heroui/react";
import {
  Phone,
  Navigation,
  Info,
  Route as RouteIcon,
  Eye,
  MapPin,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api-client";

interface TripDetailsProps {
  tripId: string;
  pageLoading?: boolean;
}

type DispatcherTrip = {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  journeyDate: string;
  journeyTime: string;
  vehicleType: string;
  ac: boolean;
  seats: number;
  fare: string;
  status: string;
  pickupName: string;
  pickupZone: string;
  dropName: string;
  dropZone: string;
  qrToken?: string;
  driverId?: string | null;
};

export default function TripDetails({ tripId, pageLoading }: TripDetailsProps) {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useQuery<DispatcherTrip>({
    queryKey: ["dispatcher-trip", tripId],
    queryFn: async () => {
      return request(`/api/dispatchers/${tripId}`, {
        method: "GET",
      });
    },
    enabled: !!tripId,
    refetchInterval: 5000,
  });

  if (!tripId) {
    if (pageLoading) return <TripDetailsSkeleton />;
    return (
      <div className="h-full flex items-center justify-center px-6 text-center text-default-400">
        <div className="space-y-2">
          <p className="text-lg font-semibold">Select a Trip</p>
          <p className="text-sm">Choose a trip from the queue to view ride details</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <TripDetailsSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="h-full flex items-center justify-center px-6 text-center">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-danger">
            Failed to load trip
          </p>
          <p className="text-sm text-default-500">
            Please retry or select another booking.
          </p>
        </div>
      </div>
    );
  }

  const trip = data;
  const driverLink = trip.qrToken && trip.driverId
    ? `${window.location.origin}/driver/${trip.qrToken}`
    : null;

  function handleCopy() {
    if (!driverLink) return;
    navigator.clipboard.writeText(driverLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pickup = `${trip.pickupName}, ${trip.pickupZone}`;
  const drop = `${trip.dropName}, ${trip.dropZone}`;

  const dirUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    pickup,
  )}&destination=${encodeURIComponent(drop)}&travelmode=driving`;

  const pickUpUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    pickup,
  )}`;

  const dropUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    drop,
  )}`;

  return (
    <div className="flex flex-col h-full bg-content1 overflow-y-auto scrollbar-thin p-6 gap-3">
      <Surface className="p-3 flex items-center justify-between rounded-xl border border-divider bg-accent/10">
        <div className="flex items-center gap-4">
          <Avatar color="accent" variant="soft">
            <Avatar.Fallback>
              {trip.customerName.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>

          <div>
            <h3 className="text-lg font-bold">{trip.customerName}</h3>
            <p className="text-sm text-default-500">{trip.customerPhone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button isIconOnly variant="secondary">
            <Eye size={16} />
          </Button>

          <Link
            href={`tel:${trip.customerPhone}`}
            className={buttonVariants({
              isIconOnly: true,
              variant: "primary",
            })}
          >
            <Phone size={16} />
          </Link>
        </div>
      </Surface>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-accent">
          <Info size={18} />
          <h4 className="font-semibold">Ride Information</h4>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <DetailItem label="Trip ID" value={trip.id} />
          <DetailItem
            label="Requested At"
            value={new Date(trip.createdAt).toLocaleString()}
          />
          <DetailItem label="Booking Ref" value={trip.bookingRef} />
          <DetailItem label="Status" value={trip.status} />
          <DetailItem label="Journey Date" value={trip.journeyDate} />
          <DetailItem label="Journey Time" value={trip.journeyTime} />
          <DetailItem label="Fare" value={`₹${trip.fare}`} />
          <DetailItem label="Vehicle Type" value={trip.vehicleType} />
          <DetailItem label="AC Preference" value={trip.ac ? "AC" : "Non-AC"} />
          <DetailItem label="Seats" value={`${trip.seats} seats`} />
        </div>
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-accent">
          <RouteIcon size={18} />
          <h4 className="font-bold text-sm uppercase tracking-wider">Route</h4>
        </div>

        <div className="relative flex flex-col gap-3 pl-2">
          <div className="absolute left-[11px] top-2 w-[1.5px] h-[calc(100%-20px)] bg-default-200" />

          <div className="flex items-center justify-between relative pl-6">
            <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-white ring-1 ring-accent" />

            <div>
              <span className="text-xs text-muted">Pick Up</span>
              <p className="text-sm font-semibold text-accent">{pickup}</p>
            </div>

            <Link
              href={pickUpUrl}
              target="_blank"
              className={buttonVariants({
                isIconOnly: true,
                size: "sm",
                variant: "secondary",
              })}
            >
              <MapPin size={16} />
            </Link>
          </div>

          <div className="flex items-center justify-between relative pl-6">
            <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded bg-default-900 border-2 border-white ring-1 ring-default-900" />

            <div>
              <span className="text-xs text-muted">Drop Off</span>
              <p className="text-sm font-semibold">{drop}</p>
            </div>

            <Link
              href={dropUrl}
              target="_blank"
              className={buttonVariants({
                isIconOnly: true,
                size: "sm",
                variant: "secondary",
              })}
            >
              <MapPin size={16} />
            </Link>
          </div>
        </div>

        <Link
          href={dirUrl}
          target="_blank"
          className={buttonVariants({
            variant: "secondary",
            fullWidth: true,
            className:
              "mt-2 bg-emerald-50 text-emerald-700 font-semibold border-emerald-400",
          })}
        >
          <Navigation size={18} />
          Open Route in Google Maps
        </Link>
      </div>

      {driverLink && (
        <>
          <Separator className="my-2" />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">Driver Tracking Link</p>
            <div className="flex items-center gap-2 rounded-xl border border-divider bg-content2 px-3 py-2">
              <p className="flex-1 truncate text-xs font-mono text-default-600">{driverLink}</p>
              <Button isIconOnly size="sm" variant="secondary" onPress={handleCopy}>
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </Button>
              <Button isIconOnly size="sm" variant="secondary" onPress={() => window.open(driverLink, "_blank")}>
                <ExternalLink size={14} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TripDetailsSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 gap-4">
      <Surface className="p-4 rounded-xl border border-divider">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </Surface>

      <div className="space-y-4">
        <Skeleton className="h-5 w-36 rounded-md" />

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Skeleton className="h-5 w-24 rounded-md" />

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-5 w-full rounded-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-5 w-full rounded-md" />
          </div>
        </div>

        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

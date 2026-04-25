"use client";

import React from "react";
import {
  Surface,
  Button,
  Avatar,
  Separator,
  buttonVariants,
} from "@heroui/react";
import {
  Phone,
  Navigation,
  Info,
  Route as RouteIcon,
  Eye,
  MapPin,
} from "lucide-react";
import Link from "next/link";

interface TripDetailsProps {
  trip: any;
}

export default function TripDetails({ trip }: TripDetailsProps) {
  if (!trip)
    return (
      <div className="h-full flex items-center justify-center text-default-400">
        Select a trip to view details
      </div>
    );

  const dirUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    trip.pickup,
  )}&destination=${encodeURIComponent(trip.drop)}&travelmode=driving`;

  const pickUpUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    trip.pickup,
  )}`;

  const dropUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    trip.drop,
  )}`;

  return (
    <div className="flex flex-col h-full bg-content1 overflow-y-auto scrollbar-thin p-6 gap-3">
      {/* 1. Customer Profile Card */}
      <Surface className="p-3 flex items-center justify-between rounded-xl border border-divider bg-accent/10">
        <div className="flex items-center gap-4">
          <Avatar color="accent" variant="soft">
            <Avatar.Fallback>DF</Avatar.Fallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-bold">{trip.customerName}</h3>
            <p className="text-sm text-default-500">+91 98765 43210</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button isIconOnly variant="secondary">
            <Eye size={16} />
          </Button>
          <Button isIconOnly variant="primary">
            <Phone size={16} />
          </Button>
        </div>
      </Surface>

      {/* 2. Ride Information Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-accent">
          <Info size={18} />
          <h4 className="font-semibold">Ride Information</h4>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <DetailItem label="Trip ID" value={trip.id} />
          <DetailItem label="Requested At" value="10:42 AM" />
          <DetailItem label="Category" value="Standard" />
          <DetailItem label="Payment" value="UPI" />
          <DetailItem label="Distance" value="12.4 km" />
          <DetailItem label="Est. Fare" value="₹340" />
          <DetailItem label="Vehicle Type" value={trip.vehicleType} />
          <DetailItem label="AC Preference" value={trip.ac ? "AC" : "Non-AC"} />
          <DetailItem label="Seats" value={`${trip.seats} seats`} />
        </div>
      </div>

      <Separator className="my-2" />

      {/* 3. Route Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-accent">
          <RouteIcon size={18} />
          <h4 className="font-bold text-sm uppercase tracking-wider">Route</h4>
        </div>

        <div className="relative flex flex-col gap-3 pl-2">
          {/* Timeline Connector Line */}
          <div className="absolute left-[11px] top-2 w-[1.5px] h-[calc(100%-20px)] bg-default-200" />

          {/* Pick Up Row */}
          <div className="flex items-center justify-between relative pl-6">
            <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-white ring-1 ring-accent" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted">Pick Up</span>
              <p className="text-sm font-semibold text-accent leading-tight">
                {trip.pickup}
              </p>
            </div>
            <Link
              href={pickUpUrl}
              target="_blank"
              className={buttonVariants({
                isIconOnly: true,
                size: "sm",
                variant: "secondary",
              })}
              aria-label="View pickup on map"
            >
              <MapPin size={16} />
            </Link>
          </div>

          {/* Drop Off Row */}
          <div className="flex items-center justify-between relative pl-6">
            <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded bg-default-900 border-2 border-white ring-1 ring-default-900" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted">Drop Off</span>
              <p className="text-sm font-semibold leading-tight">{trip.drop}</p>
            </div>
            <Link
              href={dropUrl}
              target="_blank"
              className={buttonVariants({
                isIconOnly: true,
                size: "sm",
                variant: "secondary",
              })}
              aria-label="View drop off on map"
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
              "mt-2 bg-emerald-50 text-emerald-700 font-semibold border-emerald-400 ",
          })}
        >
          <Navigation size={18} />
          Open Route in Google Maps
        </Link>
      </div>
    </div>
  );
}

// Sub-component for clean mapping
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

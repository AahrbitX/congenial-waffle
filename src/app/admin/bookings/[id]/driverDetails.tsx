import React, { useState } from "react";
import { Phone, UserPlus, Copy, Check } from "lucide-react";

import UserAvatar from "@/components/user/avatar";
import { Button, Card, Separator } from "@heroui/react";
import { AssignDriverDrawer } from "../assignDriver";
import Link from "next/link";

type Props = {
  driver: any;
  qrToken?: string;
  bookingId?: string;
  status?: string;
};

export default function DriverDetails({
  driver,
  qrToken,
  bookingId,
  status,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const driverLink = qrToken
    ? `${window.location.origin}/driver/${qrToken}`
    : null;

  function handleCopy() {
    if (!driverLink) return;
    navigator.clipboard.writeText(driverLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  const details = [
    {
      label: "Id",
      value: driver.id,
    },
    {
      label: "Vehicle",
      value: driver.vehicleType,
    },
    {
      label: "AC",
      value: driver.ac ? "AC" : "Non-AC",
    },
    {
      label: "Total Trips",
      value: driver.totalTrips || "-",
    },
    {
      label: "Rating",
      value: driver.rating || "-",
    },
    {
      label: "Vehicle No.",
      value: driver.vehicleNumber,
    },
  ];

  if (!driver.name) {
    return (
      <Card className="gap-2">
        <Card.Header>
          <Card.Title>Driver Assignment</Card.Title>
        </Card.Header>

        <Separator />

        <Card.Content>
          <div className="flex flex-col items-center justify-center rounded-xl bg-secondary/40 px-6 py-4 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <UserPlus size={24} className="text-accent" />
            </div>

            <h3 className="text-base font-semibold">No driver assigned</h3>

            <p className="mt-2 max-w-sm text-sm text-muted">
              This ride has not been assigned to any driver yet. Assign a driver
              to begin trip execution and tracking.
            </p>

            {status === "confirmed" && bookingId && (
              <>
                <Button className="mt-5" onPress={() => setAssignOpen(true)}>
                  <UserPlus size={16} />
                  Assign Driver
                </Button>
                <AssignDriverDrawer
                  bookingId={bookingId}
                  isOpen={assignOpen}
                  onClose={() => setAssignOpen(false)}
                />
              </>
            )}
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="gap-2">
      <Card.Header className="flex-row items-center justify-between">
        <Card.Title>Driver Details</Card.Title>
        <Link
          href={`/admin/drivers/${driver.id}`}
          className="text-accent text-sm font-medium"
        >
          View Driver Profile
        </Link>
      </Card.Header>
      <Separator />

      <Card.Content className="">
        <div className="bg-success/10 flex items-center justify-between p-4 rounded-xl text-sm my-2">
          <div className="flex items-center gap-4">
            <UserAvatar username={driver.name} color="success" />
            <div>
              <p className="font-bold text-lg">{driver.name}</p>
              <p>{driver.phone}</p>
            </div>
          </div>
          <Button isIconOnly size="lg" className={"bg-success"}>
            <Phone />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 px-1">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="flex flex-col items-start justify-between"
            >
              <p className="text-xs text-muted">{detail.label}</p>
              <p className="text-sm font-semibold">{detail.value}</p>
            </div>
          ))}
        </div>

        {/* {driverLink && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-divider bg-surface-muted px-3 py-2">
            <p className="flex-1 truncate text-xs text-muted font-mono">
              {driverLink}
            </p>
            <Button
              isIconOnly
              size="sm"
              variant="secondary"
              onPress={handleCopy}
            >
              {copied ? (
                <Check size={14} className="text-success" />
              ) : (
                <Copy size={14} />
              )}
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="secondary"
              onPress={() => window.open(driverLink, "_blank")}
            >
              <ExternalLink size={14} />
            </Button>
          </div>
        )} */}
      </Card.Content>
    </Card>
  );
}

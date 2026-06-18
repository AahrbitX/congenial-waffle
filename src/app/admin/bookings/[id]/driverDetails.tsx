import React, { useState } from "react";
import { Phone, UserPlus, RefreshCw, UserCog, ExternalLink, Copy, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import UserAvatar from "@/components/user/avatar";
import { Card, Separator, toast } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { AssignDriverDrawer } from "../assignDriver";
import Link from "next/link";
import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

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
  const [assignOpen, setAssignOpen] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const trackingUrl = qrToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/driver/${qrToken}` : null;

  function copyLink() {
    if (!trackingUrl) return;
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  const resendMutation = useMutation({
    mutationFn: () =>
      request(`/api/dispatchers/${bookingId}/resend-link`, { method: "POST" }),
    onSuccess: () => toast.success("Tracking link resent to driver"),
    onError: () => toast("Failed to resend link", { variant: "danger" }),
  });

  const details = [
    { label: "Id",         value: driver.id },
    { label: "Vehicle",    value: driver.vehicleType },
    { label: "AC",         value: driver.ac ? "AC" : "Non-AC" },
    { label: "Total Trips",value: driver.totalTrips || "-" },
    { label: "Rating",     value: driver.rating || "-" },
    { label: "Vehicle No.",value: driver.vehicleNumber },
  ];

  const canAssign  = status === "pending" && bookingId;
  const canChange  = ["confirmed", "ongoing"].includes(status ?? "") && bookingId && driver.name;
  const canResend  = ["confirmed", "ongoing"].includes(status ?? "") && bookingId && driver.name;

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

            {canAssign && (
              <>
                <Button className="mt-5" onPress={() => setAssignOpen(true)}>
                  <UserPlus size={16} />
                  Assign Driver
                </Button>
                <AssignDriverDrawer
                  bookingId={bookingId}
                  isOpen={assignOpen}
                  onClose={() => setAssignOpen(false)}
                  mode="assign"
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
          View Profile
        </Link>
      </Card.Header>
      <Separator />

      <Card.Content className="space-y-4">
        {/* Driver info */}
        <div className="bg-success/10 flex items-center justify-between p-4 rounded-xl text-sm">
          <div className="flex items-center gap-4">
            <UserAvatar username={driver.name} color="success" />
            <div>
              <p className="font-bold text-lg">{driver.name}</p>
              <p className="text-muted">{driver.phone}</p>
            </div>
          </div>
          <a href={`tel:${driver.phone}`}>
            <Button isIconOnly size="lg" className="bg-success">
              <Phone />
            </Button>
          </a>
        </div>

        {/* Driver stats grid */}
        <div className="grid grid-cols-3 gap-4 px-1">
          {details.map((detail) => (
            <div key={detail.label} className="flex flex-col items-start justify-between">
              <p className="text-xs text-muted">{detail.label}</p>
              <p className="text-sm font-semibold">{detail.value}</p>
            </div>
          ))}
        </div>

        {/* Admin actions */}
        {(canChange || canResend) && (
          <>
            <Separator />
            <div className="flex gap-2">
              {canResend && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  isLoading={resendMutation.isPending}
                  onPress={() => resendMutation.mutate()}
                >
                  <RefreshCw size={14} />
                  Resend WhatsApp Link
                </Button>
              )}
              {canChange && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onPress={() => setChangeOpen(true)}
                >
                  <UserCog size={14} />
                  Change Driver
                </Button>
              )}
            </div>
          </>
        )}

        {/* Tracking link */}
        {trackingUrl && driver.name && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Driver Tracking Link</p>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2">
                <p className="flex-1 text-xs text-text-secondary truncate font-mono">{trackingUrl}</p>
                <a href={trackingUrl} target="_blank" rel="noreferrer">
                  <Button isIconOnly size="sm" variant="ghost"><ExternalLink size={13} /></Button>
                </a>
                <Button isIconOnly size="sm" variant="ghost" onPress={copyLink}>
                  {copiedLink ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                </Button>
              </div>
            </div>
          </>
        )}

      </Card.Content>

      {canChange && (
        <AssignDriverDrawer
          bookingId={bookingId!}
          isOpen={changeOpen}
          onClose={() => setChangeOpen(false)}
          mode="change"
        />
      )}
    </Card>
  );
}

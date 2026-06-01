import React from "react";
import { Car, CalendarDays, Clock, Users, Wind, Thermometer } from "lucide-react";
import { Card, Separator, cn } from "@heroui/react";

type InfoData = {
  requestedAt: string;
  vehicleType: string;
  ac:          boolean;
  journeyDate: string;
  journeyTime: string;
  members:     number;
};

type Props = {
  info: InfoData;
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day:     "2-digit",
    month:   "short",
    year:    "numeric",
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return "—";
  // "HH:MM:SS" → 12-hour with AM/PM
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatRequestedAt(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

export default function RideInformation({ info }: Props) {
  const fields = [
    {
      icon:  <CalendarDays size={15} className="text-primary" />,
      label: "Journey Date",
      value: formatDate(info.journeyDate),
    },
    {
      icon:  <Clock size={15} className="text-primary" />,
      label: "Pickup Time",
      value: formatTime(info.journeyTime),
    },
    {
      icon:  <Car size={15} className="text-primary" />,
      label: "Vehicle Type",
      value: info.vehicleType
        ? info.vehicleType.charAt(0).toUpperCase() + info.vehicleType.slice(1)
        : "—",
    },
    {
      icon:  <Users size={15} className="text-primary" />,
      label: "Passengers",
      value: `${info.members} seat${info.members !== 1 ? "s" : ""}`,
    },
  ];

  return (
    <Card className="gap-2">
      <Card.Header>
        <Card.Title>Trip Information</Card.Title>
      </Card.Header>
      <Separator />

      <Card.Content className="space-y-4">
        {/* AC badge */}
        <div className="flex items-center gap-2">
          {info.ac ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600">
              <Thermometer size={12} />
              AC
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-muted text-text-secondary">
              <Wind size={12} />
              Non-AC
            </span>
          )}
          <span className="text-xs text-text-tertiary">
            Requested {formatRequestedAt(info.requestedAt)}
          </span>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex items-start gap-2.5 rounded-xl bg-surface-muted/60 p-3"
            >
              <div className="mt-0.5 shrink-0">{f.icon}</div>
              <div>
                <p className="text-[11px] text-text-tertiary uppercase tracking-wide font-medium">
                  {f.label}
                </p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">
                  {f.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

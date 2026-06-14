import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Card, Separator } from "@heroui/react";
import StatusIndicator from "@/components/data/statusIndicator";

type Leg = {
  id: string;
  bookingRef: string;
  status: string;
  legType: string;
  journeyDate: string;
  journeyTime: string;
  driverName: string | null;
};

type Props = {
  bookingRef: string;
  status: string;
  legType: string;
  journeyDate: string;
  journeyTime: string;
  driverName?: string | null;
  linkedBookingId: string;
  linkedLeg: Leg | null;
};

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(t: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function LegCell({
  leg,
  isCurrent,
  href,
}: {
  leg: {
    bookingRef: string;
    status: string;
    legType: string;
    journeyDate: string;
    journeyTime: string;
    driverName?: string | null;
  };
  isCurrent: boolean;
  href?: string;
}) {
  const inner = (
    <div
      className={`rounded-xl p-3 space-y-2 h-full transition-colors ${
        isCurrent
          ? "bg-accent/10 border-2 border-accent"
          : "bg-surface-muted/60 border border-border hover:border-accent/40 hover:bg-accent/5 cursor-pointer"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-semibold  ${isCurrent ? "text-accent" : "text-muted-foreground"}`}
        >
          {leg.legType === "outbound" ? "Outbound" : "Return"}
        </span>
        <StatusIndicator status={leg.status} />
      </div>

      <p className="text-sm font-bold">{leg.bookingRef}</p>

      <p className="text-xs text-muted-foreground">
        {formatDate(leg.journeyDate)} · {formatTime(leg.journeyTime)}
      </p>

      {leg.driverName ? (
        <p className="text-xs text-muted-foreground">
          Driver: {leg.driverName}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground/50 italic">
          No driver assigned
        </p>
      )}

      {!isCurrent && (
        <p className="flex items-center gap-1 text-xs font-semibold text-accent pt-0.5">
          View booking <ArrowRight size={11} />
        </p>
      )}
    </div>
  );

  if (!isCurrent && href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function RoundTripDetails({
  bookingRef,
  status,
  legType,
  journeyDate,
  journeyTime,
  driverName,
  linkedBookingId,
  linkedLeg,
}: Props) {
  return (
    <Card className="gap-2">
      <Card.Header className="flex flex-row items-center gap-2">
        <RefreshCw size={14} className="text-accent shrink-0" />
        <Card.Title>Round Trip</Card.Title>
      </Card.Header>

      <Separator />

      <Card.Content>
        <div className="grid grid-cols-2 gap-2">
          {legType === "return" && linkedLeg ? (
            <>
              <LegCell
                leg={linkedLeg}
                isCurrent={false}
                href={`/admin/bookings/${linkedBookingId}`}
              />

              <LegCell
                leg={{
                  bookingRef,
                  status,
                  legType,
                  journeyDate,
                  journeyTime,
                  driverName,
                }}
                isCurrent
              />
            </>
          ) : (
            <>
              <LegCell
                leg={{
                  bookingRef,
                  status,
                  legType,
                  journeyDate,
                  journeyTime,
                  driverName,
                }}
                isCurrent
              />

              {linkedLeg ? (
                <LegCell
                  leg={linkedLeg}
                  isCurrent={false}
                  href={`/admin/bookings/${linkedBookingId}`}
                />
              ) : (
                <div className="rounded-xl p-3 border border-dashed border-border flex items-center justify-center">
                  <p className="text-xs text-muted-foreground italic">
                    Linked leg unavailable
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

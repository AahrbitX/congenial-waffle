import { Card, Separator } from "@heroui/react";
import { IconMapPin, IconNavigation } from "@/constants/icons";

interface Route {
  pickupName:  string | null;
  pickupZone:  string | null;
  pickupLat:   number | null;
  pickupLng:   number | null;
  dropName:    string | null;
  dropZone:    string | null;
  dropLat:     number | null;
  dropLng:     number | null;
}

type Props = { route: Route };

function mapsLink(
  pickupLat: number | null, pickupLng: number | null,
  dropLat:   number | null, dropLng:   number | null,
): string | null {
  if (pickupLat && pickupLng && dropLat && dropLng) {
    return `https://www.google.com/maps/dir/${pickupLat},${pickupLng}/${dropLat},${dropLng}`;
  }
  return null;
}

export default function RouteDetails({ route }: Props) {
  const link = mapsLink(route.pickupLat, route.pickupLng, route.dropLat, route.dropLng);

  return (
    <Card className="gap-2">
      <Card.Header>
        <Card.Title>Route Details</Card.Title>
      </Card.Header>
      <Separator />
      <Card.Content className="space-y-4">

        {/* Pickup */}
        <div className="flex items-start gap-3">
          <div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <div>
            <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-0.5">Pickup</p>
            <p className="text-sm font-medium text-text-primary">{route.pickupName ?? "—"}</p>
            {route.pickupZone && <p className="text-xs text-text-muted">{route.pickupZone}</p>}
          </div>
        </div>

        {/* Connector line */}
        <div className="ml-[5px] w-px h-4 bg-border" />

        {/* Drop */}
        <div className="flex items-start gap-3">
          <div className="mt-1 w-2.5 h-2.5 rounded bg-text-primary shrink-0" />
          <div>
            <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-0.5">Destination</p>
            <p className="text-sm font-medium text-text-primary">{route.dropName ?? "—"}</p>
            {route.dropZone && <p className="text-xs text-text-muted">{route.dropZone}</p>}
          </div>
        </div>

        {/* Google Maps link */}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          >
            <IconNavigation size={13} />
            Open route in Google Maps
          </a>
        )}

        {!link && (
          <p className="text-xs text-text-muted italic">
            Coordinates not available — Google Maps link unavailable.
          </p>
        )}

      </Card.Content>
    </Card>
  );
}

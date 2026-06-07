"use client";

import { motion } from "framer-motion";
import { Card, Separator } from "@heroui/react";
import { IconNavigation } from "@/constants/icons";
import Link from "next/link";

interface Route {
  pickupName: string | null;
  pickupZone: string | null;
  pickupLat: number | null;
  pickupLng: number | null;
  dropName: string | null;
  dropZone: string | null;
  dropLat: number | null;
  dropLng: number | null;
}

type Props = {
  route: Route;
};

function mapsLink(
  pickupLat: number | null,
  pickupLng: number | null,
  dropLat: number | null,
  dropLng: number | null,
) {
  if (
    pickupLat != null &&
    pickupLng != null &&
    dropLat != null &&
    dropLng != null
  ) {
    return `https://www.google.com/maps/dir/${pickupLat},${pickupLng}/${dropLat},${dropLng}`;
  }

  return null;
}

export default function RouteDetails({ route }: Props) {
  const link = mapsLink(
    route.pickupLat,
    route.pickupLng,
    route.dropLat,
    route.dropLng,
  );

  return (
    <Card>
      <Card.Header className="flex flex-row items-center justify-between">
        <Card.Title>Route Details</Card.Title>
        {link ? (
          <Link
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            <IconNavigation size={14} />
            Open Route in Google Maps
          </Link>
        ) : (
          <p className="text-xs italic text-muted">
            Coordinates unavailable for navigation.
          </p>
        )}
      </Card.Header>

      <Separator />

      <Card.Content>
        <div className="flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className="z-10 h-4 w-4 rounded-full border-2 border-primary bg-background" />

            <div className="relative my-2 h-10 w-[2px] overflow-hidden rounded-full bg-border">
              <motion.div
                animate={{
                  y: [0, 12, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary shadow-md"
              >
                <IconNavigation size={12} className="text-primary-foreground" />
              </motion.div>
            </div>

            <div className="z-10 h-4 w-4 rounded-full bg-primary shadow-sm" />
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted">
                Pickup
              </p>

              <p className="text-sm font-semibold">{route.pickupName ?? "—"}</p>

              {route.pickupZone && (
                <p className="mt-1 text-xs text-muted">{route.pickupZone}</p>
              )}
            </div>

            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted">
                Destination
              </p>

              <p className="text-sm font-semibold">{route.dropName ?? "—"}</p>

              {route.dropZone && (
                <p className="mt-1 text-xs text-muted">{route.dropZone}</p>
              )}
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

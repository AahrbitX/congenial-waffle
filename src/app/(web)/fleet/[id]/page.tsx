import type { Metadata } from "next";
import { FleetDetail } from "@/features/web/fleet/FleetDetail";
import { getFleet } from "@/api/fleet.api";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fleet = await getFleet().catch(() => []);
  const vehicle = fleet.find((v) => v.id === id);
  if (!vehicle) return { title: "Vehicle Not Found" };

  const description = `${vehicle.name}${vehicle.tagline ? ` — ${vehicle.tagline}` : ""}. ${vehicle.seats} seats, ${vehicle.fuel}, ${vehicle.ac ? "AC" : "Non-AC"}${vehicle.priceFrom ? `. Starting from ${vehicle.priceFrom}` : ""}.`;

  return {
    title: vehicle.name,
    description,
    openGraph: {
      title: `${vehicle.name} | Mohan Cabs Fleet`,
      description,
      url: `/fleet/${id}`,
    },
    alternates: { canonical: `/fleet/${id}` },
  };
}

export default async function FleetCarPage({ params }: Props) {
  const { id } = await params;
  return <FleetDetail id={id} />;
}

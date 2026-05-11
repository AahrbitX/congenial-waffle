import { FleetDetail } from "@/features/web/fleet/FleetDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FleetCarPage({ params }: Props) {
  const { id } = await params;
  return <FleetDetail id={id} />;
}

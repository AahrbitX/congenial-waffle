import { RideDetail } from "@/features/dashboard/rides/RideDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RideDetailPage({ params }: Props) {
  const { id } = await params;
  return <RideDetail id={id} />;
}

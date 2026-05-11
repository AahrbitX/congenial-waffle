import { ServiceDetail } from "@/features/web/services/ServiceDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ServiceDetail slug={slug} />;
}

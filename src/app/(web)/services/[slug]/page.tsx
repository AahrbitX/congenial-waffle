import type { Metadata } from "next";
import { ServiceDetail } from "@/features/web/services/ServiceDetail";
import { getServiceBySlug } from "@/api/services.api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug).catch(() => undefined);
  if (!service) return { title: "Service Not Found" };

  return {
    title: service.name,
    description: service.description,
    openGraph: {
      title: `${service.name} | Mohan Cabs`,
      description: service.description,
      url: `/services/${slug}`,
    },
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ServiceDetail slug={slug} />;
}

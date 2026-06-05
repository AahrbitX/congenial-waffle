import type { MetadataRoute } from "next";
import { getServices } from "@/api/services.api";
import { getFleet } from "@/api/fleet.api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mohancabs.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                  lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/about`,       lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services`,    lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/fleet`,       lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/contact`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/help`,        lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/safety`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terms`,       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const [services, fleet] = await Promise.all([
    getServices().catch(() => []),
    getFleet().catch(() => []),
  ]);

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const fleetRoutes: MetadataRoute.Sitemap = fleet
    .filter((v) => v.active)
    .map((v) => ({
      url: `${base}/fleet/${v.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...serviceRoutes, ...fleetRoutes];
}

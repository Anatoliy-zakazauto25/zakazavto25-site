import type { MetadataRoute } from "next";
import { getPublicVehicles } from "@/lib/public-vehicles";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/cases`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/request`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
  const vehicles = await getPublicVehicles();
  return [...staticPages, ...vehicles.map((vehicle) => ({ url: `${baseUrl}/catalog/${vehicle.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 }))];
}

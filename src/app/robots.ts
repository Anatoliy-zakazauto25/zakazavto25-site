import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: ["/", "/catalog", "/about", "/cases", "/request"], disallow: ["/admin", "/api", "/login", "/orders/track"] }], sitemap: `${baseUrl}/sitemap.xml` };
}

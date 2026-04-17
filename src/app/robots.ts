import type { MetadataRoute } from "next";
import { getPrimarySiteUrl } from "@/lib/seo";

const SITE_URL = getPrimarySiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

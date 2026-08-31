import type { MetadataRoute } from "next";

import { publicSiteUrl } from "@/lib/deploy-rules";

export default function robots(): MetadataRoute.Robots {
  const base = publicSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/search", "/api/", "/studio", "/admin", "/demo"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

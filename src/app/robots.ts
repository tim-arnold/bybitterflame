import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/play/", "/create", "/account"],
    },
    sitemap: "https://bybitterflame.com/sitemap.xml",
  };
}
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/cart",
          "/checkout",
          "/order-confirmation",
          "/login",
        ],
      },
    ],
    sitemap: new URL(
      "/sitemap.xml",
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobilecases.example.com",
    ).toString(),
  };
}

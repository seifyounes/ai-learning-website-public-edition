import type { MetadataRoute } from "next";
import { getAllLessons } from "@/lib/content";
import { ALL_PILLARS } from "@/lib/curriculum";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const pages = ["", "/start-here", "/foundations", "/applications", "/path", "/get-hired", "/about", "/search"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" as const, priority: p ? 0.7 : 1 })),
    ...ALL_PILLARS.map((p) => ({ url: `${base}/${p.section}/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...getAllLessons().map((l) => ({
      url: `${base}${l.href}`,
      lastModified: l.reviewedOn,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}

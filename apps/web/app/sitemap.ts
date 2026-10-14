import type { MetadataRoute } from "next"
import { SHOW_DEVELOPER_TOOLS } from "@/lib/features"
import { getAllLanguageSlugs } from "@/lib/languages"
import { ogImageUrl } from "@/lib/og"
import { absoluteUrl, SITE_URL } from "@/lib/site"

const LAST_CONTENT_UPDATE = new Date("2026-08-11T00:00:00.000Z")

// Next's metadata serializer inserts URLs verbatim. Escape only at this XML
// boundary, leaving the shared URL helpers unchanged for HTML metadata.
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export default function sitemap(): MetadataRoute.Sitemap {
  const languagePages = getAllLanguageSlugs().map((slug) => ({
    url: absoluteUrl(`/${slug}`),
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: [ogImageUrl("language", { language: slug })],
  }))

  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 1,
      images: [ogImageUrl("code")],
    },
    ...languagePages,
    {
      url: absoluteUrl("/markdown"),
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [ogImageUrl("markdown")],
    },
    {
      url: absoluteUrl("/csv"),
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 0.8,
      images: [ogImageUrl("csv")],
    },
    {
      url: absoluteUrl("/docs"),
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [ogImageUrl("docs")],
    },
    ...(SHOW_DEVELOPER_TOOLS
      ? [
          {
            url: absoluteUrl("/cli"),
            lastModified: LAST_CONTENT_UPDATE,
            changeFrequency: "monthly" as const,
            priority: 0.7,
            images: [ogImageUrl("cli")],
          },
          {
            url: absoluteUrl("/mcp"),
            lastModified: LAST_CONTENT_UPDATE,
            changeFrequency: "monthly" as const,
            priority: 0.7,
            images: [ogImageUrl("mcp")],
          },
        ]
      : []),
    ...["about", "blog", "privacy", "terms", "changelog"].map((path) => ({
      url: absoluteUrl(`/${path}`),
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly" as const,
      priority: path === "blog" ? 0.6 : 0.4,
    })),
  ]

  return entries.map((entry) => ({
    ...entry,
    url: escapeXml(entry.url),
    ...(entry.images ? { images: entry.images.map(escapeXml) } : {}),
  }))
}

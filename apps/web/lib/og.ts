import { absoluteUrl } from "@/lib/site"

export type OgKind = "code" | "markdown" | "csv" | "language" | "mcp" | "cli" | "docs"

const OG_IMAGE_VERSION = "2026-08-12-6"

export function ogImageUrl(kind: OgKind, options: { language?: string } = {}) {
  const url = new URL(absoluteUrl("/api/og"))
  url.searchParams.set("kind", kind)
  url.searchParams.set("v", OG_IMAGE_VERSION)

  if (options.language) {
    url.searchParams.set("language", options.language)
  }

  return url.toString()
}

export function ogImagePath(kind: OgKind, options: { language?: string } = {}) {
  const url = new URL(ogImageUrl(kind, options))
  return `${url.pathname}${url.search}`
}

import { resolveSitemap } from "next/dist/build/webpack/loaders/metadata/resolve-route-data"
import { afterEach, describe, expect, it, vi } from "vitest"
import { getAllLanguageSlugs } from "@/lib/languages"
import { ogImageUrl } from "@/lib/og"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe("sitemap XML", () => {
  it.each([false, true])("preserves valid image URLs with developer tools enabled: %s", async (enabled) => {
    vi.stubEnv("NEXT_PUBLIC_SHOW_DEVELOPER_TOOLS", String(enabled))
    vi.resetModules()
    const { default: sitemap } = await import("@/app/sitemap")
    // Exercise the installed Next serializer, not only our input objects. This
    // also detects double-escaping if a future Next release escapes URLs itself.
    const xml = resolveSitemap(sitemap())
    const document = new DOMParser().parseFromString(xml, "application/xml")

    expect(document.querySelector("parsererror")).toBeNull()
    const locations = Array.from(document.getElementsByTagName("loc"), (node) => node.textContent)
    expect(locations).toHaveLength(getAllLanguageSlugs().length + 9 + (enabled ? 2 : 0))
    expect(new Set(locations).size).toBe(locations.length)
    expect(locations).toContain("https://codeprint.app/markdown")
    expect(locations).toContain("https://codeprint.app/csv")
    expect(locations.includes("https://codeprint.app/cli")).toBe(enabled)
    expect(locations.includes("https://codeprint.app/mcp")).toBe(enabled)
    expect(locations).not.toContain("https://codeprint.app/social-previews")

    const images = Array.from(
      document.getElementsByTagNameNS("http://www.google.com/schemas/sitemap-image/1.1", "loc"),
      (node) => node.textContent,
    )
    expect(images).toContain(ogImageUrl("code"))
    for (const language of getAllLanguageSlugs()) {
      expect(images).toContain(ogImageUrl("language", { language }))
    }
    expect(xml).toContain("&amp;v=")
    expect(xml).not.toContain("&amp;amp;")
  })
})

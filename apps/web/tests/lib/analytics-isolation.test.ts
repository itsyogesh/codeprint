import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { canReplayPath } from "@/lib/analytics-privacy"
import nextConfig from "../../next.config.mjs"

const app = path.resolve(import.meta.dirname, "../../app")
const marketingRoutes = ["about", "blog", "changelog", "cli", "docs", "mcp", "privacy", "terms"]

describe("hard replay document boundary", () => {
  it("has independent root layouts, without an overriding persistent app root", () => {
    expect(existsSync(path.join(app, "layout.tsx"))).toBe(false)
    const marketing = readFileSync(path.join(app, "(marketing)/layout.tsx"), "utf8")
    const tools = readFileSync(path.join(app, "(tools)/layout.tsx"), "utf8")
    expect(marketing).toContain("<AppRoot marketing>")
    expect(tools).toContain("<AppRoot>")
    expect(tools).not.toContain("<AppRoot marketing")
    const shared = readFileSync(path.join(app, "../components/shared/app-root.tsx"), "utf8")
    expect(shared).toContain('data-clarity-mask="true"')
    expect(shared).toContain("clarityId={marketing ? process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID : undefined}")
  })

  it("keeps only the exact replay allowlist in the marketing root", () => {
    const directories = readdirSync(path.join(app, "(marketing)"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
    expect(directories).toEqual(marketingRoutes)
    for (const route of directories) expect(canReplayPath(`/${route}`)).toBe(true)
    for (const route of [
      "page.tsx",
      "[language]/page.tsx",
      "markdown/page.tsx",
      "csv/page.tsx",
      "social-previews/page.tsx",
      "print/[language]/page.tsx",
      "print/markdown/page.tsx",
      "print/csv/page.tsx",
    ])
      expect(existsSync(path.join(app, "(tools)", route))).toBe(true)
  })

  it("blocks Clarity scripts by default and suppresses document referrers", async () => {
    const headers = await nextConfig.headers!()
    const defaults = headers.find((rule) => rule.source === "/:path*")!
    expect(defaults.headers).toContainEqual({ key: "Referrer-Policy", value: "no-referrer" })
    expect(defaults.headers.find((header) => header.key === "Content-Security-Policy")!.value).not.toContain(
      "clarity.ms",
    )
    const exceptions = headers.filter((rule) => rule.source !== "/:path*")
    expect(exceptions).toHaveLength(1)
    expect(exceptions[0].source).toBe("/:page(mcp|cli|about|docs|privacy|terms|changelog|blog)")
    expect(exceptions[0].headers[0].value).toContain("https://*.clarity.ms")
    // Public URL imports must continue to connect directly to arbitrary hosts.
    expect(defaults.headers[1].value).not.toContain("connect-src")
  })
})

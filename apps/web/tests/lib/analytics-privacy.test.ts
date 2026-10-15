import { describe, expect, it } from "vitest"
import {
  canReplayPath,
  canReplayUrl,
  hasTrackingOptOut,
  isProductionHost,
  readConsent,
  sanitizeAnalyticsUrl,
} from "@/lib/analytics-privacy"

describe("analytics privacy boundaries", () => {
  it("strips private queries and fragments", () => {
    expect(sanitizeAnalyticsUrl("https://codeprint.app/markdown?filename=secret.md#private")).toBe(
      "https://codeprint.app/markdown",
    )
    expect(sanitizeAnalyticsUrl("not a URL")).toBe("")
  })
  it("never starts replay on editors or preview surfaces", () => {
    for (const path of ["/", "/markdown", "/csv", "/python", "/social-previews"])
      expect(canReplayPath(path)).toBe(false)
    expect(canReplayPath("/mcp")).toBe(true)
  })
  it("excludes localhost, deployments, DNT, and GPC", () => {
    expect(isProductionHost("localhost")).toBe(false)
    expect(isProductionHost("codeprint-preview.vercel.app")).toBe(false)
    expect(isProductionHost("codeprint.app")).toBe(true)
    expect(hasTrackingOptOut({ doNotTrack: "1" })).toBe(true)
    expect(hasTrackingOptOut({ globalPrivacyControl: true })).toBe(true)
  })
  it("only replays clean, exact marketing URLs", () => {
    for (const path of ["/mcp", "/cli", "/about", "/docs", "/privacy", "/terms", "/changelog", "/blog"])
      expect(canReplayUrl(`https://codeprint.app${path}`)).toBe(true)
    for (const url of [
      "https://codeprint.app/docs?file=secret",
      "https://codeprint.app/mcp#private",
      "https://codeprint.app/docs/secret",
      "https://example.com/mcp",
      "https://codeprint.app/print/markdown",
      "not a URL",
    ])
      expect(canReplayUrl(url)).toBe(false)
  })
  it("rejects corrupt, missing and unavailable preference storage", () => {
    for (const value of [null, "true", "1", "yes", "{}"])
      expect(readConsent({ getItem: () => value }, "test")).toBeNull()
    expect(
      readConsent(
        {
          getItem: () => {
            throw new Error("blocked")
          },
        },
        "test",
      ),
    ).toBeNull()
  })
})

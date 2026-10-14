import { describe, expect, it } from "vitest"
import { canReplayPath, hasTrackingOptOut, isProductionHost, sanitizeAnalyticsUrl } from "@/lib/analytics-privacy"

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
})

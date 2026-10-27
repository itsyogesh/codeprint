import { describe, expect, it } from "vitest"
import nextConfig from "../../next.config.mjs"

describe("PDF worker policy", () => {
  it("allows local PNG/PDF workers without giving workers third-party script access", async () => {
    for (const rule of await nextConfig.headers!()) {
      const policy = rule.headers.find((header) => header.key === "Content-Security-Policy")?.value
      if (!policy) continue
      expect(
        policy
          .split(";")
          .find((directive) => directive.trim().startsWith("worker-src"))
          ?.trim(),
      ).toBe("worker-src 'self' blob:")
    }
  })
})

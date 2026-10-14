import { describe, expect, it } from "vitest"
import { getWebMcpContext, parseWebMcpDocument } from "@/lib/webmcp"

describe("experimental WebMCP input", () => {
  it("validates source, strips local paths, and accepts physical page options", () => {
    expect(
      parseWebMcpDocument(
        { content: "# Read me", filename: "/private/project/readme.md", pageSize: "letter" },
        "markdown",
      ),
    ).toMatchObject({ filename: "readme.md", pageSize: "letter" })
    expect(() => parseWebMcpDocument({ content: "" }, "code")).toThrow()
    expect(() => parseWebMcpDocument({ content: "x", pageSize: "giant" }, "csv")).toThrow()
    expect(() => parseWebMcpDocument({ content: "x".repeat(4_000_001) }, "code")).toThrow()
  })
  it("prefers the current Document API and safely ignores unsupported browsers", () => {
    const current = { registerTool: () => undefined }
    const legacy = { registerTool: () => undefined }
    expect(
      getWebMcpContext(
        { modelContext: current } as unknown as Document,
        { modelContext: legacy } as unknown as Navigator,
      ),
    ).toBe(current)
    expect(getWebMcpContext({} as Document, {} as Navigator)).toBeUndefined()
  })
})

import { afterEach, describe, expect, it } from "vitest"
import { sourceEditorAnchor, takeTransferredSource, transferSource } from "@/lib/source-transfer"

const source = {
  content: "# Reading copy",
  filename: "notes.md",
  language: "markdown",
  format: "markdown" as const,
  sourceUrl: "https://example.org/notes.md",
  sizeBytes: 14,
}
afterEach(() => {
  sessionStorage.clear()
  window.history.replaceState(null, "", "/")
})

describe("reviewed source handoff", () => {
  it.each([
    ["code", "editor-section"],
    ["markdown", "md-editor-section"],
    ["csv", "csv-editor-section"],
  ] as const)("lands in the %s editor", (format, anchor) => {
    expect(sourceEditorAnchor(format)).toBe(anchor)
  })
  it("keeps content out of URLs and consumes the tab-local document once", () => {
    expect(transferSource(source)).toBe("/markdown#imported-file")
    window.history.replaceState(null, "", "/markdown#imported-file")
    expect(takeTransferredSource("markdown")).toEqual(source)
    expect(takeTransferredSource("markdown")).toBeNull()
  })
  it("does not load an unsolicited saved document without an explicit handoff", () => {
    transferSource(source)
    expect(takeTransferredSource("markdown")).toBeNull()
  })
  it("rejects expired, invalid, and wrong-editor documents and clears their data", () => {
    window.history.replaceState(null, "", "/markdown#imported-file")
    sessionStorage.setItem("codeprint:reviewed-url-import", JSON.stringify({ source, expires: Date.now() - 1 }))
    expect(takeTransferredSource("markdown")).toBeNull()
    transferSource(source)
    expect(takeTransferredSource("csv")).toBeNull()
    expect(sessionStorage.getItem("codeprint:reviewed-url-import")).toBeNull()
    sessionStorage.setItem("codeprint:reviewed-url-import", "not JSON")
    expect(takeTransferredSource("markdown")).toBeNull()
  })
})

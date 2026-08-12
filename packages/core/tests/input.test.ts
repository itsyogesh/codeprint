import { describe, expect, it } from "vitest"
import { assertPrintableInput, safePdfFilename, sourceFilename } from "../src"

describe("printable input", () => {
  it("creates filesystem-safe PDF names without changing the source format", () => {
    expect(safePdfFilename("../../My review notes.md", "markdown")).toBe("My-review-notes.pdf")
    expect(safePdfFilename("payload.json", "code")).toBe("payload.pdf")
    expect(safePdfFilename(".env", "code")).toBe("env.pdf")
    expect(sourceFilename({ format: "csv" })).toBe("data.csv")
  })

  it("rejects empty input and out-of-range font sizes", () => {
    expect(() => assertPrintableInput({ content: "  ", format: "markdown" })).toThrow("cannot be empty")
    expect(() => assertPrintableInput({ content: "hello", format: "code", fontSize: 25 })).toThrow("between 8 and 24")
    expect(() => assertPrintableInput({ content: "hello", format: "code", columns: 0 })).toThrow("between 1 and 3")
    expect(() => assertPrintableInput({ content: "hello", format: "code", columns: 2.5 })).toThrow("whole number")
  })
})

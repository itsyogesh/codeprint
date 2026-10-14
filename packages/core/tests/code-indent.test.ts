import { describe, expect, it } from "vitest"
import { codeLineIndent } from "../src/pdf/code-indent"

describe("codeLineIndent", () => {
  it.each([
    { segments: [], columns: 0 },
    { segments: [{ text: "return" }], columns: 0 },
    { segments: [{ text: "    return" }], columns: 4 },
    { segments: [{ text: "\treturn" }], columns: 4 },
    { segments: [{ text: " \t return" }], columns: 6 },
    { segments: [{ text: "  " }, { text: "  " }, { text: "return" }], columns: 4 },
    { segments: [{ text: "" }, { text: "    " }, { text: "return" }], columns: 4 },
    { segments: [{ text: "return " }, { text: "    " }], columns: 0 },
  ])("counts $columns monospace indentation columns", ({ segments, columns }) => {
    expect(codeLineIndent(segments, 10)).toBe(columns * 6)
  })
})

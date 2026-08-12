import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"
import { MARKDOWN_LEADING } from "../src/pdf/pdf-styles"
import { renderPrintablePdf } from "../src/render"

const hasPdfText = !spawnSync("pdftotext", ["-v"], { encoding: "utf8" }).error

function wordYMin(xml: string, word: string) {
  const match = xml.match(new RegExp(`yMin="([\\d.]+)"[^>]*>${word}</word>`))
  if (!match) throw new Error(`Could not find ${word} in PDF layout output`)
  return Number(match[1])
}

describe("editorial PDF typography", () => {
  it("keeps body, list, and code leading close to the heading scale", () => {
    expect(MARKDOWN_LEADING.display).toBeLessThan(MARKDOWN_LEADING.sectionHeading)
    expect(MARKDOWN_LEADING.sectionHeading).toBeLessThan(MARKDOWN_LEADING.heading)
    expect(MARKDOWN_LEADING.heading).toBeLessThan(MARKDOWN_LEADING.body)
    expect(MARKDOWN_LEADING.body).toBeLessThanOrEqual(1.45)
    expect(MARKDOWN_LEADING.body - MARKDOWN_LEADING.display).toBeLessThanOrEqual(0.25)
    expect(MARKDOWN_LEADING.list).toBeLessThanOrEqual(MARKDOWN_LEADING.body)
    expect(MARKDOWN_LEADING.code).toBeLessThanOrEqual(MARKDOWN_LEADING.body)
  })

  it.runIf(hasPdfText)("applies the selected body size to paragraphs and lists", async () => {
    const rendered = await renderPrintablePdf({
      content: "ParagraphAlpha  \nParagraphBeta\n\n- ListAlpha  \n  ListBeta",
      format: "markdown",
      filename: "leading.md",
      fontSize: 14,
    })
    const extracted = spawnSync("pdftotext", ["-bbox-layout", "-", "-"], {
      input: Buffer.from(rendered.bytes),
      encoding: "utf8",
    })
    if (extracted.error) throw extracted.error
    if (extracted.status !== 0) throw new Error(extracted.stderr || "pdftotext failed")

    const paragraphGap = wordYMin(extracted.stdout, "ParagraphBeta") - wordYMin(extracted.stdout, "ParagraphAlpha")
    const listGap = wordYMin(extracted.stdout, "ListBeta") - wordYMin(extracted.stdout, "ListAlpha")

    expect(paragraphGap).toBeCloseTo(14 * 0.75 * MARKDOWN_LEADING.body, 1)
    expect(listGap).toBeCloseTo(14 * 0.75 * MARKDOWN_LEADING.list, 1)
  })
})

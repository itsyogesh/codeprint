import { spawnSync } from "node:child_process"
import { PDFDocument } from "pdf-lib"
import { describe, expect, it } from "vitest"
import { renderPrintablePdf } from "../src/render"

const hasPdfText = !spawnSync("pdftotext", ["-v"], { encoding: "utf8" }).error

function extractPdfText(bytes: Uint8Array) {
  const extracted = spawnSync("pdftotext", ["-layout", "-", "-"], {
    input: Buffer.from(bytes),
    encoding: "utf8",
  })
  if (extracted.error) throw extracted.error
  if (extracted.status !== 0) throw new Error(extracted.stderr || "pdftotext failed")
  return extracted.stdout
}

function extractPdfPageText(bytes: Uint8Array, page: number) {
  const extracted = spawnSync("pdftotext", ["-layout", "-f", String(page), "-l", String(page), "-", "-"], {
    input: Buffer.from(bytes),
    encoding: "utf8",
  })
  if (extracted.error) throw extracted.error
  if (extracted.status !== 0) throw new Error(extracted.stderr || "pdftotext failed")
  return extracted.stdout
}

function extractPdfPageLayout(bytes: Uint8Array, page: number) {
  const extracted = spawnSync("pdftotext", ["-bbox-layout", "-f", String(page), "-l", String(page), "-", "-"], {
    input: Buffer.from(bytes),
    encoding: "utf8",
  })
  if (extracted.error) throw extracted.error
  if (extracted.status !== 0) throw new Error(extracted.stderr || "pdftotext failed")

  const pageHeight = Number(extracted.stdout.match(/<page [^>]*height="([\d.]+)"/)?.[1])
  const words = Array.from(
    extracted.stdout.matchAll(/<word [^>]*yMin="([\d.]+)" [^>]*yMax="([\d.]+)">([^<]*)<\/word>/g),
    (match) => ({ yMin: Number(match[1]), yMax: Number(match[2]), text: match[3] }),
  )
  return { pageHeight, words }
}

function withoutWhitespace(value: string) {
  return value.replace(/\s+/g, "")
}

describe("renderPrintablePdf", () => {
  it.each([
    {
      content: "# Reading notes\n\nA printable **Markdown** document.",
      format: "markdown" as const,
      filename: "notes.md",
    },
    { content: "const answer: number = 42\n", format: "code" as const, filename: "answer.ts", language: "typescript" },
    { content: "Document,Status\nArchitecture,Ready\n", format: "csv" as const, filename: "status.csv" },
  ])("renders $format through the shared PDF engine", async (input) => {
    const result = await renderPrintablePdf(input)
    expect(Buffer.from(result.bytes.subarray(0, 5)).toString("ascii")).toBe("%PDF-")
    expect(result.pages).toBeGreaterThan(0)
    expect(result.suggestedFilename).toBe(input.filename.replace(/\.[^.]+$/, ".pdf"))
  })

  it("uses fewer pages when code is laid out in two columns", async () => {
    const content = Array.from({ length: 180 }, (_, index) => `const value${index + 1} = ${index + 1}`).join("\n")
    const singleColumn = await renderPrintablePdf({
      content,
      format: "code",
      filename: "columns.ts",
      language: "typescript",
      columns: 1,
    })
    const twoColumns = await renderPrintablePdf({
      content,
      format: "code",
      filename: "columns.ts",
      language: "typescript",
      columns: 2,
    })

    expect(singleColumn.pages).toBeGreaterThan(1)
    expect(twoColumns.pages).toBeGreaterThan(0)
    expect(twoColumns.pages).toBeLessThan(singleColumn.pages)
  })

  it("keeps every manually paginated code page at the selected physical paper size", async () => {
    const result = await renderPrintablePdf({
      content: Array.from({ length: 120 }, (_, index) => `const value${index + 1} = ${index + 1}`).join("\n"),
      format: "code",
      filename: "physical-pages.ts",
      language: "typescript",
      pageSize: "a4",
      orientation: "portrait",
      columns: 2,
    })
    const document = await PDFDocument.load(result.bytes)

    for (const page of document.getPages()) {
      const { width, height } = page.getSize()
      expect(width).toBeCloseTo(595.28, 1)
      expect(height).toBeCloseTo(841.89, 1)
    }
  })

  it("paginates CSV according to the selected glyph size", async () => {
    const content = [
      "Name,Status",
      ...Array.from({ length: 140 }, (_, index) => `Editorial item ${index + 1},Ready`),
    ].join("\n")
    const compact = await renderPrintablePdf({ content, format: "csv", filename: "small.csv", fontSize: 8 })
    const large = await renderPrintablePdf({ content, format: "csv", filename: "large.csv", fontSize: 24 })

    expect(compact.pages).toBeGreaterThan(0)
    expect(large.pages).toBeGreaterThan(compact.pages)
  })

  describe.skipIf(!hasPdfText)("PDF text fidelity", () => {
    it("renders Markdown page chrome on every physical page", async () => {
      const content = [
        "# Page chrome",
        ...Array.from(
          { length: 90 },
          (_, index) =>
            `Paragraph ${index + 1}. Editorial rendering keeps page furniture outside the reading measure while preserving a steady text rhythm.`,
        ),
      ].join("\n\n")
      const result = await renderPrintablePdf({ content, format: "markdown", filename: "chrome.md" })

      expect(result.pages).toBeGreaterThan(2)
      for (let page = 1; page <= result.pages; page += 1) {
        const pageText = extractPdfPageText(result.bytes, page)
        const layout = extractPdfPageLayout(result.bytes, page)
        const filename = layout.words.find((word) => word.text === "chrome.md")
        const paragraphWords = layout.words.filter((word) => word.text === "Paragraph")
        const footerPageWord = layout.words
          .filter((word) => word.text === "Page")
          .sort((left, right) => right.yMin - left.yMin)[0]

        expect(pageText).toContain("chrome.md")
        expect(pageText).toContain(`Page ${page} of ${result.pages}`)
        expect(filename?.yMin).toBeLessThan(60)
        expect(paragraphWords.length).toBeGreaterThan(0)
        expect(Math.min(...paragraphWords.map((word) => word.yMin))).toBeGreaterThan(filename?.yMax ?? 0)
        expect(footerPageWord?.yMin).toBeGreaterThan(layout.pageHeight - 60)
        expect(Math.max(...paragraphWords.map((word) => word.yMax))).toBeLessThan(footerPageWord?.yMin ?? 0)
      }
    })

    it("repeats long Markdown table headers only across the table pages and keeps rows intact", async () => {
      const header = "| Row | Description | Tail |\n| --- | --- | --- |"
      const rows = Array.from(
        { length: 64 },
        (_, index) =>
          `| Row-${String(index + 1).padStart(2, "0")} | Editorial table row ${index + 1} with enough descriptive text to exercise pagination. | END-${String(index + 1).padStart(2, "0")} |`,
      )
      const suffix = [
        "# After table",
        ...Array.from({ length: 30 }, (_, index) => `Closing paragraph ${index + 1} remains outside the table run.`),
      ].join("\n\n")
      const result = await renderPrintablePdf({
        content: `${header}\n${rows.join("\n")}\n\n${suffix}`,
        format: "markdown",
        filename: "long-table.md",
      })
      const pages = Array.from({ length: result.pages }, (_, index) => extractPdfPageText(result.bytes, index + 1))
      const normalizedPages = pages.map(withoutWhitespace)
      const tablePages = normalizedPages
        .map((text, index) => (text.includes("Row-01") || /Row-\d{2}/.test(text) ? index : -1))
        .filter((index) => index >= 0)

      expect(tablePages.length).toBeGreaterThan(1)
      for (const pageIndex of tablePages) {
        expect(normalizedPages[pageIndex]).toContain("RowDescriptionTail")
      }
      for (let row = 1; row <= rows.length; row += 1) {
        const rowLabel = `Row-${String(row).padStart(2, "0")}`
        const tailLabel = `END-${String(row).padStart(2, "0")}`
        expect(normalizedPages.some((text) => text.includes(rowLabel) && text.includes(tailLabel))).toBe(true)
      }

      const afterTablePage = normalizedPages.findIndex((text) => text.includes("Aftertable"))
      expect(afterTablePage).toBeGreaterThan(Math.max(...tablePages))
      for (let pageIndex = afterTablePage; pageIndex < normalizedPages.length; pageIndex += 1) {
        expect(normalizedPages[pageIndex]).not.toContain("RowDescriptionTail")
      }
    })

    it("moves a short Markdown table intact when it reaches a page boundary", async () => {
      const preface = [
        "# Short table placement",
        ...Array.from(
          { length: 20 },
          (_, index) =>
            `Preface ${index + 1}. Editorial paragraphs reserve enough reading space to bring the following compact table close to a page boundary.`,
        ),
      ].join("\n\n")
      const table = [
        "| Header | Value |",
        "| --- | --- |",
        "| ShortRowOne | TailOne |",
        "| ShortRowTwo | TailTwo |",
        "| ShortRowThree | TailThree |",
      ].join("\n")
      const result = await renderPrintablePdf({
        content: `${preface}\n\n${table}`,
        format: "markdown",
        filename: "short-table.md",
        tableOfContents: true,
      })
      const pages = Array.from({ length: result.pages }, (_, index) =>
        withoutWhitespace(extractPdfPageText(result.bytes, index + 1)),
      )
      const tablePage = pages.findIndex((text) => text.includes("HeaderValue"))

      expect(result.pages).toBeGreaterThan(1)
      expect(tablePage).toBeGreaterThanOrEqual(0)
      expect(pages[tablePage]).toContain("ShortRowOneTailOne")
      expect(pages[tablePage]).toContain("ShortRowTwoTailTwo")
      expect(pages[tablePage]).toContain("ShortRowThreeTailThree")
    })

    it("does not insert hyphens into Markdown source identifiers", async () => {
      const identifier = "anotherFunctionCallWithManyArgumentsAndAnExtremelyLongIdentifier"
      const source = `const result = ${identifier}(alpha, beta, gamma, delta)`
      const result = await renderPrintablePdf({
        content: `# Source fidelity\n\n\`\`\`typescript\n${source}\n\`\`\``,
        format: "markdown",
        filename: "identifier.md",
        fontSize: 20,
      })

      expect(withoutWhitespace(extractPdfText(result.bytes))).toContain(withoutWhitespace(source))
    })

    it("keeps a short Markdown list marker with its complete item", async () => {
      const preface = Array.from(
        { length: 10 },
        (_, index) =>
          `Setup paragraph ${index + 1}. This material fills the reading measure so the following list item reaches a physical page boundary.`,
      ).join("\n\n")
      const itemTail = "KeepThisShortListItemTogether"
      const result = await renderPrintablePdf({
        content: `${preface}\n\n17. A compact list item must carry its marker and its complete text to the same page, including ${itemTail}.`,
        format: "markdown",
        filename: "short-list.md",
      })
      const pages = Array.from({ length: result.pages }, (_, index) => extractPdfPageText(result.bytes, index + 1))
      const markerPage = pages.findIndex((text) => text.includes("17."))
      const itemTailPage = pages.findIndex((text) => text.includes(itemTail))

      expect(markerPage).toBeGreaterThanOrEqual(0)
      expect(itemTailPage).toBe(markerPage)
    })

    it("does not insert hyphens into wrapped source-code identifiers", async () => {
      const content =
        "const result = anotherFunctionCallWithManyArgumentsAndAnExtremelyLongIdentifier(alpha, beta, gamma, delta)"
      const result = await renderPrintablePdf({
        content,
        format: "code",
        filename: "identifier.ts",
        language: "typescript",
        fontSize: 12,
        columns: 2,
      })

      expect(withoutWhitespace(extractPdfText(result.bytes))).toContain(withoutWhitespace(content))
    })

    it("does not insert hyphens into long CSV values", async () => {
      const value = "anotherFunctionCallWithManyArgumentsAndAnExtremelyLongIdentifier"
      const content = `Name,Value\nExample,${value}`
      const result = await renderPrintablePdf({
        content,
        format: "csv",
        filename: "identifiers.csv",
        fontSize: 24,
      })

      expect(withoutWhitespace(extractPdfText(result.bytes))).toContain(value)
    })
  })
})

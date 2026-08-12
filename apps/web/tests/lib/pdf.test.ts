import { describe, expect, it } from "vitest"
import { pdfFilename, readPdfPageCount } from "@/lib/pdf"

describe("pdfFilename", () => {
  it("keeps an existing PDF extension regardless of case", () => {
    expect(pdfFilename("report.PDF")).toBe("report.PDF")
  })

  it("replaces a source extension", () => {
    expect(pdfFilename("architecture.md")).toBe("architecture.pdf")
    expect(pdfFilename("data.csv")).toBe("data.pdf")
  })

  it("uses a safe fallback for an empty filename", () => {
    expect(pdfFilename("")).toBe("codeprint-document.pdf")
  })
})

describe("readPdfPageCount", () => {
  it("counts the page dictionaries emitted by React PDF", async () => {
    const source = [
      "%PDF-1.3",
      "1 0 obj << /Type /Pages /Count 3 /Kids [2 0 R 3 0 R 4 0 R] >> endobj",
      "2 0 obj << /Type /Page /Parent 1 0 R >> endobj",
      "3 0 obj << /Type /Page /Parent 1 0 R >> endobj",
      "4 0 obj << /Type /Page /Parent 1 0 R >> endobj",
    ].join("\n")

    await expect(readPdfPageCount(new Blob([source], { type: "application/pdf" }))).resolves.toBe(3)
  })

  it("falls back to the largest page-tree count", async () => {
    const source = "%PDF-1.7\n1 0 obj << /Type /Pages /Count 12 >> endobj"

    await expect(readPdfPageCount(new Blob([source], { type: "application/pdf" }))).resolves.toBe(12)
  })

  it("returns null when page metadata is unavailable", async () => {
    await expect(readPdfPageCount(new Blob(["%PDF-1.7"], { type: "application/pdf" }))).resolves.toBeNull()
  })
})

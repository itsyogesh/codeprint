import type { MarkdownSettings } from "../types"

interface FinalizeMarkdownPdfOptions {
  bytes: ArrayBuffer | Uint8Array
  filename: string
  settings: MarkdownSettings
}

export interface FinalizedMarkdownPdf {
  bytes: Uint8Array
  pageCount: number
}

/**
 * Counts and normalizes the physical-page document emitted by React PDF.
 * Page boxes and page chrome are owned by PdfMarkdownDocument so browser and
 * Node renderers use one layout pass and annotations keep their native
 * coordinates.
 */
export async function finalizeMarkdownPdf({
  bytes,
  filename,
  settings,
}: FinalizeMarkdownPdfOptions): Promise<FinalizedMarkdownPdf> {
  void filename
  void settings
  const { PDFDocument } = await import("pdf-lib")
  const pdfDocument = await PDFDocument.load(bytes, { updateMetadata: false })

  return {
    bytes: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
    pageCount: pdfDocument.getPageCount(),
  }
}

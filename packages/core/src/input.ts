import type { CreatePrintablePdfInput, PageOrientation, PageSize, PrintableFormat } from "./types"

export const MAX_CONTENT_LENGTH = 4_000_000

export const DEFAULT_SOURCE_FILENAMES: Record<PrintableFormat, string> = {
  markdown: "document.md",
  code: "code.txt",
  csv: "data.csv",
}

export const DEFAULT_PAGE_SIZE: PageSize = "a4"
export const DEFAULT_ORIENTATION: PageOrientation = "portrait"

export function assertPrintableInput(input: CreatePrintablePdfInput) {
  if (!input.content.trim()) throw new Error("Document content cannot be empty.")
  if (input.content.length > MAX_CONTENT_LENGTH) {
    throw new Error(`Document content cannot exceed ${MAX_CONTENT_LENGTH.toLocaleString("en-US")} characters.`)
  }
  if (input.fontSize !== undefined && (input.fontSize < 8 || input.fontSize > 24)) {
    throw new Error("Font size must be between 8 and 24 points.")
  }
  if (input.columns !== undefined && (!Number.isInteger(input.columns) || input.columns < 1 || input.columns > 3)) {
    throw new Error("Code columns must be a whole number between 1 and 3.")
  }
}

export function sourceFilename(input: Pick<CreatePrintablePdfInput, "filename" | "format">) {
  return input.filename?.trim() || DEFAULT_SOURCE_FILENAMES[input.format]
}

export function safePdfFilename(filename: string | undefined, format: PrintableFormat) {
  const source = (filename?.trim() || DEFAULT_SOURCE_FILENAMES[format]).split(/[\\/]/).pop() ?? ""
  const lastDot = source.lastIndexOf(".")
  const stem = lastDot > 0 ? source.slice(0, lastDot) : source
  const cleaned = stem
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^\.+/, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)

  return `${cleaned || "codeprint-document"}.pdf`
}

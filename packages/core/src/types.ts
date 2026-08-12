export type PrintableFormat = "markdown" | "code" | "csv"
export type PageSize = "a4" | "letter" | "legal"
export type PageOrientation = "portrait" | "landscape"

export interface CodeSettings {
  lineNumbers: boolean
  columns: number
  fontSize: number
  orientation: PageOrientation
  colorized: boolean
  pageSize: PageSize
  showHeader: boolean
}

export interface MarkdownSettings {
  fontSize: number
  fontFamily: string
  headingFont: string
  codeFont: string
  margins: "small" | "normal" | "wide"
  showToc: boolean
  codeBlockTheme: "light" | "dark"
  pageSize: PageSize
  orientation: PageOrientation
  showHeader: boolean
}

export interface CSVSettings {
  hasHeaderRow: boolean
  alternatingColors: boolean
  fontSize: number
  pageSize: PageSize
  orientation: PageOrientation
  showHeader: boolean
}

export interface CreatePrintablePdfInput {
  content: string
  format: PrintableFormat
  filename?: string
  language?: string
  pageSize?: PageSize
  orientation?: PageOrientation
  fontSize?: number
  showHeader?: boolean
  margins?: MarkdownSettings["margins"]
  tableOfContents?: boolean
  codeTheme?: MarkdownSettings["codeBlockTheme"]
  lineNumbers?: boolean
  columns?: number
  colorized?: boolean
  hasHeaderRow?: boolean
  alternatingColors?: boolean
}

export interface RenderedPdf {
  bytes: Uint8Array
  format: PrintableFormat
  pages: number
  sourceFilename: string
  suggestedFilename: string
}

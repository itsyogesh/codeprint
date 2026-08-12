import { DEFAULT_ORIENTATION, DEFAULT_PAGE_SIZE } from "./input"
import type { CodeSettings, CreatePrintablePdfInput, CSVSettings, MarkdownSettings } from "./types"

export const DEFAULT_CODE_SETTINGS: Readonly<CodeSettings> = {
  lineNumbers: true,
  columns: 1,
  fontSize: 12,
  orientation: DEFAULT_ORIENTATION,
  colorized: true,
  pageSize: DEFAULT_PAGE_SIZE,
  showHeader: true,
}

export const DEFAULT_MARKDOWN_SETTINGS: Readonly<MarkdownSettings> = {
  fontSize: 14,
  fontFamily: "Mulish",
  headingFont: "Merriweather",
  codeFont: "Source Code Pro",
  margins: "normal",
  showToc: false,
  codeBlockTheme: "light",
  pageSize: DEFAULT_PAGE_SIZE,
  orientation: DEFAULT_ORIENTATION,
  showHeader: true,
}

export const DEFAULT_CSV_SETTINGS: Readonly<CSVSettings> = {
  hasHeaderRow: true,
  alternatingColors: true,
  fontSize: 12,
  pageSize: DEFAULT_PAGE_SIZE,
  orientation: DEFAULT_ORIENTATION,
  showHeader: true,
}

export function normalizeCodeSettings(input: CreatePrintablePdfInput): CodeSettings {
  return {
    lineNumbers: input.lineNumbers ?? DEFAULT_CODE_SETTINGS.lineNumbers,
    columns: input.columns ?? DEFAULT_CODE_SETTINGS.columns,
    fontSize: input.fontSize ?? DEFAULT_CODE_SETTINGS.fontSize,
    orientation: input.orientation ?? DEFAULT_CODE_SETTINGS.orientation,
    colorized: input.colorized ?? DEFAULT_CODE_SETTINGS.colorized,
    pageSize: input.pageSize ?? DEFAULT_CODE_SETTINGS.pageSize,
    showHeader: input.showHeader ?? DEFAULT_CODE_SETTINGS.showHeader,
  }
}

export function normalizeMarkdownSettings(input: CreatePrintablePdfInput): MarkdownSettings {
  return {
    fontSize: input.fontSize ?? DEFAULT_MARKDOWN_SETTINGS.fontSize,
    fontFamily: DEFAULT_MARKDOWN_SETTINGS.fontFamily,
    headingFont: DEFAULT_MARKDOWN_SETTINGS.headingFont,
    codeFont: DEFAULT_MARKDOWN_SETTINGS.codeFont,
    margins: input.margins ?? DEFAULT_MARKDOWN_SETTINGS.margins,
    showToc: input.tableOfContents ?? DEFAULT_MARKDOWN_SETTINGS.showToc,
    codeBlockTheme: input.codeTheme ?? DEFAULT_MARKDOWN_SETTINGS.codeBlockTheme,
    pageSize: input.pageSize ?? DEFAULT_MARKDOWN_SETTINGS.pageSize,
    orientation: input.orientation ?? DEFAULT_MARKDOWN_SETTINGS.orientation,
    showHeader: input.showHeader ?? DEFAULT_MARKDOWN_SETTINGS.showHeader,
  }
}

export function normalizeCsvSettings(input: CreatePrintablePdfInput): CSVSettings {
  return {
    hasHeaderRow: input.hasHeaderRow ?? DEFAULT_CSV_SETTINGS.hasHeaderRow,
    alternatingColors: input.alternatingColors ?? DEFAULT_CSV_SETTINGS.alternatingColors,
    fontSize: input.fontSize ?? DEFAULT_CSV_SETTINGS.fontSize,
    pageSize: input.pageSize ?? DEFAULT_CSV_SETTINGS.pageSize,
    orientation: input.orientation ?? DEFAULT_CSV_SETTINGS.orientation,
    showHeader: input.showHeader ?? DEFAULT_CSV_SETTINGS.showHeader,
  }
}

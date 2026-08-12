export interface SourcePosition {
  line: number
  column: number
  offset?: number
}

export interface SourceRange {
  start: SourcePosition
  end: SourcePosition
}

export interface DocumentBlockBase {
  /** Stable within one parsed document. It must not depend on render order. */
  id: string
  source?: SourceRange
}

export type InlineMark = "bold" | "italic" | "strikethrough" | "code"

export interface TextInline {
  kind: "text"
  text: string
  marks?: readonly InlineMark[]
}

export interface LinkInline {
  kind: "link"
  href: string
  children: readonly TextInline[]
}

export interface BreakInline {
  kind: "break"
}

export type InlineContent = TextInline | LinkInline | BreakInline

export interface ParagraphBlock extends DocumentBlockBase {
  kind: "paragraph"
  children: readonly InlineContent[]
}

export interface HeadingBlock extends DocumentBlockBase {
  kind: "heading"
  depth: 1 | 2 | 3 | 4 | 5 | 6
  children: readonly InlineContent[]
}

export interface CodeBlock extends DocumentBlockBase {
  kind: "code"
  code: string
  language?: string
  caption?: string
}

export interface MermaidBlock extends DocumentBlockBase {
  kind: "mermaid"
  sourceText: string
  title?: string
  description?: string
  caption?: string
}

export interface MathBlock extends DocumentBlockBase {
  kind: "math"
  sourceText: string
  display: boolean
  title?: string
  description?: string
}

export interface ChartBlock extends DocumentBlockBase {
  kind: "chart"
  grammar: "vega-lite"
  specification: Readonly<Record<string, unknown>>
  title?: string
  description?: string
}

export interface QuoteBlock extends DocumentBlockBase {
  kind: "quote"
  children: readonly DocumentBlock[]
}

export interface ListItem {
  id: string
  checked?: boolean
  children: readonly DocumentBlock[]
}

export interface ListBlock extends DocumentBlockBase {
  kind: "list"
  ordered: boolean
  start?: number
  items: readonly ListItem[]
}

export interface TableCell {
  children: readonly InlineContent[]
  alignment?: "left" | "center" | "right"
}

export interface TableBlock extends DocumentBlockBase {
  kind: "table"
  header?: readonly TableCell[]
  rows: readonly (readonly TableCell[])[]
  caption?: string
}

export interface ThematicBreakBlock extends DocumentBlockBase {
  kind: "thematic-break"
}

export type DocumentBlock =
  | ParagraphBlock
  | HeadingBlock
  | CodeBlock
  | MermaidBlock
  | MathBlock
  | ChartBlock
  | QuoteBlock
  | ListBlock
  | TableBlock
  | ThematicBreakBlock

export interface DocumentModel {
  version: 1
  blocks: readonly DocumentBlock[]
  title?: string
  language?: string
}

export interface PrintAssetBase {
  width: number
  height: number
  rendererId: string
  sourceHash: string
  title?: string
  description?: string
  warnings: readonly string[]
}

export interface VectorPrintAsset extends PrintAssetBase {
  kind: "vector"
  format: "svg"
  svg: string
}

export interface RasterPrintAsset extends PrintAssetBase {
  kind: "raster"
  format: "png"
  bytes: Uint8Array
}

export type PrintAsset = VectorPrintAsset | RasterPrintAsset

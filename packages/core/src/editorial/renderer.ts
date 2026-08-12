import type { EditorialLimits } from "./limits"
import type { DocumentBlock, PrintAsset } from "./model"

export interface EditorialPalette {
  background: string
  foreground: string
  secondaryText: string
  mutedText: string
  faintText: string
  line: string
  accent: string
  surface: string
  border: string
  groupHeader: string
  keyBadge: string
}

export const CODEPRINT_LIGHT_PALETTE: EditorialPalette = Object.freeze({
  background: "#FFFFFF",
  foreground: "#0F172A",
  secondaryText: "#334155",
  mutedText: "#64748B",
  faintText: "#94A3B8",
  line: "#64748B",
  accent: "#F97316",
  surface: "#F8FAFC",
  border: "#CBD5E1",
  groupHeader: "#FFF7ED",
  keyBadge: "#FFEDD5",
})

export interface EditorialFontSet {
  body: string
  mono: string
}

export const CODEPRINT_EDITORIAL_FONTS: EditorialFontSet = Object.freeze({
  body: "Mulish",
  mono: "Source Code Pro",
})

export interface EditorialRenderContext {
  limits: EditorialLimits
  palette?: EditorialPalette
  fonts?: EditorialFontSet
  signal?: AbortSignal
}

export interface BlockRenderer<TBlock extends DocumentBlock = DocumentBlock> {
  readonly id: string
  supports(block: DocumentBlock): block is TBlock
  render(block: TBlock, context: EditorialRenderContext): Promise<PrintAsset>
}

export function findBlockRenderer(
  block: DocumentBlock,
  renderers: readonly BlockRenderer[],
): BlockRenderer | undefined {
  return renderers.find((renderer) => renderer.supports(block))
}

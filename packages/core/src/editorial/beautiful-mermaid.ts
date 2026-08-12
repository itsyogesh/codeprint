import { assertInputWithinLimits, assertNotAborted, stableEditorialHash, withEditorialDeadline } from "./limits"
import {
  assertMermaidComplexityWithinLimits,
  estimateMermaidComplexity,
  renderedMermaidComplexity,
  requireBeautifulMermaidFamily,
} from "./mermaid"
import type { DocumentBlock, MermaidBlock, VectorPrintAsset } from "./model"
import {
  type BlockRenderer,
  CODEPRINT_EDITORIAL_FONTS,
  CODEPRINT_LIGHT_PALETTE,
  type EditorialPalette,
  type EditorialRenderContext,
} from "./renderer"
import { normalizeEditorialSvg } from "./svg-normalizer"

/** The dependency boundary for beautiful-mermaid's renderMermaidSVG export. */
export interface BeautifulMermaidColors {
  bg: string
  fg: string
  line: string
  accent: string
  muted: string
  surface: string
  border: string
  font: string
}

export type BeautifulMermaidRenderFunction = (
  source: string,
  colors: Readonly<BeautifulMermaidColors>,
) => string | Promise<string>

export interface BeautifulMermaidAdapterOptions {
  rendererId?: string
  rendererVersion?: string
}

function beautifulMermaidColors(palette: EditorialPalette, font: string): BeautifulMermaidColors {
  return Object.freeze({
    bg: palette.background,
    fg: palette.foreground,
    line: palette.line,
    accent: palette.accent,
    muted: palette.mutedText,
    surface: palette.surface,
    border: palette.border,
    font,
  })
}

export function createBeautifulMermaidBlockRenderer(
  renderMermaidSvg: BeautifulMermaidRenderFunction,
  options: BeautifulMermaidAdapterOptions = {},
): BlockRenderer<MermaidBlock> {
  const rendererId = options.rendererId ?? "beautiful-mermaid"
  const rendererVersion = options.rendererVersion ?? "injected"

  const renderer: BlockRenderer<MermaidBlock> = {
    id: rendererId,
    supports(block: DocumentBlock): block is MermaidBlock {
      return block.kind === "mermaid"
    },
    async render(block: MermaidBlock, context: EditorialRenderContext): Promise<VectorPrintAsset> {
      const { limits, signal } = context
      assertNotAborted(signal)
      assertInputWithinLimits(block.sourceText, limits)
      const family = requireBeautifulMermaidFamily(block.sourceText)
      assertMermaidComplexityWithinLimits(estimateMermaidComplexity(block.sourceText, family), limits, "source")
      const palette = context.palette ?? CODEPRINT_LIGHT_PALETTE
      const fonts = context.fonts ?? CODEPRINT_EDITORIAL_FONTS
      const colors = beautifulMermaidColors(palette, fonts.body)
      const rawSvg = await withEditorialDeadline(
        () => renderMermaidSvg(block.sourceText, colors),
        limits.renderTimeoutMs,
        signal,
      )
      assertNotAborted(signal)
      assertMermaidComplexityWithinLimits(renderedMermaidComplexity(rawSvg), limits, "rendered")

      const title = block.title?.trim() || `${family[0]!.toUpperCase()}${family.slice(1)} diagram`
      const description = block.description?.trim() || `Printable ${family} diagram rendered from Mermaid source.`
      const normalized = normalizeEditorialSvg(
        rawSvg,
        { title, description },
        { limits, palette, fontFamily: fonts.body, monoFontFamily: fonts.mono },
      )
      const sourceHash = stableEditorialHash(
        JSON.stringify({
          rendererId,
          rendererVersion,
          source: block.sourceText,
          family,
          palette,
          font: fonts.body,
        }),
      )

      return {
        kind: "vector",
        format: "svg",
        svg: normalized.svg,
        width: normalized.width,
        height: normalized.height,
        rendererId,
        sourceHash,
        title,
        description,
        warnings: normalized.removed,
      }
    },
  }

  return Object.freeze(renderer)
}

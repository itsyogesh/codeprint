import { marked, type Token, type Tokens } from "marked"
import { assertNotAborted, EditorialRenderError, resolveEditorialLimits, stableEditorialHash } from "./editorial/limits"
import type { PrintAssetRasterizer } from "./editorial/rasterizer"
import type { BlockRenderer } from "./editorial/renderer"

export interface MarkdownMermaidFence {
  key: string
  sourceText: string
  title?: string
  caption?: string
}

interface PreparedMarkdownDiagramBase {
  key: string
  sourceText: string
  title?: string
  caption?: string
}

export interface PreparedMarkdownDiagramImage extends PreparedMarkdownDiagramBase {
  kind: "image"
  pngDataUri: string
  pixelWidth: number
  pixelHeight: number
  rendererId: string
  sourceHash: string
  description?: string
  warnings: readonly string[]
}

export interface PreparedMarkdownDiagramFallback extends PreparedMarkdownDiagramBase {
  kind: "fallback"
  warning: string
  errorCode?: string
}

export type PreparedMarkdownDiagram = PreparedMarkdownDiagramImage | PreparedMarkdownDiagramFallback

export interface PreparedMarkdownDiagrams {
  version: 1
  byKey: Readonly<Record<string, PreparedMarkdownDiagram>>
}

export interface PrepareMarkdownDiagramsOptions {
  renderer: BlockRenderer
  rasterizer: PrintAssetRasterizer
  signal?: AbortSignal
}

const MERMAID_LANGUAGE = /^mermaid(?:\s|$)/i
const FENCE_ATTRIBUTE = /\b(title|caption)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/gi
const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

export function markdownMermaidAssetKey(
  sourceText: string,
  metadata: Pick<MarkdownMermaidFence, "title" | "caption"> = {},
): string {
  return stableEditorialHash(
    `codeprint:markdown:mermaid:v1\ntitle:${metadata.title?.trim() ?? ""}\ncaption:${metadata.caption?.trim() ?? ""}\n${sourceText}`,
  )
}

export function isMarkdownMermaidFence(token: Token): token is Tokens.Code {
  return token.type === "code" && MERMAID_LANGUAGE.test((token as Tokens.Code).lang?.trim() ?? "")
}

function fenceMetadata(language: string | undefined): Pick<MarkdownMermaidFence, "title" | "caption"> {
  const metadata: Pick<MarkdownMermaidFence, "title" | "caption"> = {}
  const value = language ?? ""
  let match = FENCE_ATTRIBUTE.exec(value)
  while (match) {
    const name = match[1].toLowerCase() as "title" | "caption"
    const attributeValue = (match[2] ?? match[3] ?? match[4] ?? "").trim()
    if (attributeValue) metadata[name] = attributeValue
    match = FENCE_ATTRIBUTE.exec(value)
  }
  FENCE_ATTRIBUTE.lastIndex = 0
  return metadata
}

export function markdownMermaidFenceFromToken(token: Tokens.Code): MarkdownMermaidFence {
  const sourceText = token.text
  const metadata = fenceMetadata(token.lang)
  return {
    key: markdownMermaidAssetKey(sourceText, metadata),
    sourceText,
    ...metadata,
  }
}

function collectFromTokens(tokens: readonly Token[], collected: Map<string, MarkdownMermaidFence>): void {
  for (const token of tokens) {
    if (isMarkdownMermaidFence(token)) {
      const fence = markdownMermaidFenceFromToken(token)
      if (!collected.has(fence.key)) collected.set(fence.key, fence)
    }

    if ("tokens" in token && Array.isArray(token.tokens)) collectFromTokens(token.tokens, collected)
    if (token.type === "list") {
      for (const item of (token as Tokens.List).items) collectFromTokens(item.tokens, collected)
    }
  }
}

export function collectMarkdownMermaidFences(content: string): readonly MarkdownMermaidFence[] {
  const collected = new Map<string, MarkdownMermaidFence>()
  collectFromTokens(marked.lexer(content, { gfm: true }), collected)
  return Object.freeze([...collected.values()])
}

export function hasMarkdownMermaidFences(content: string): boolean {
  return collectMarkdownMermaidFences(content).length > 0
}

function bytesToBase64(bytes: Uint8Array): string {
  let encoded = ""
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0
    const second = bytes[index + 1] ?? 0
    const third = bytes[index + 2] ?? 0
    const value = (first << 16) | (second << 8) | third
    encoded += BASE64_ALPHABET[(value >> 18) & 63]
    encoded += BASE64_ALPHABET[(value >> 12) & 63]
    encoded += index + 1 < bytes.length ? BASE64_ALPHABET[(value >> 6) & 63] : "="
    encoded += index + 2 < bytes.length ? BASE64_ALPHABET[value & 63] : "="
  }
  return encoded
}

function fallbackWarning(error: unknown): { warning: string; errorCode?: string } {
  if (error instanceof EditorialRenderError) {
    switch (error.code) {
      case "UNSUPPORTED_DIAGRAM":
        return {
          warning: "Diagram not rendered: this Mermaid diagram type is not supported yet.",
          errorCode: error.code,
        }
      case "INPUT_TOO_LARGE":
      case "OUTPUT_TOO_LARGE":
        return {
          warning: "Diagram not rendered: this Mermaid diagram exceeds the safe print limits.",
          errorCode: error.code,
        }
      case "RENDER_TIMEOUT":
        return { warning: "Diagram not rendered: Mermaid rendering timed out.", errorCode: error.code }
      case "INVALID_SVG":
      case "UNSAFE_SVG":
        return { warning: "Diagram not rendered: check the Mermaid syntax.", errorCode: error.code }
      default:
        return { warning: "Diagram not rendered: check the Mermaid syntax.", errorCode: error.code }
    }
  }
  return { warning: "Diagram not rendered: check the Mermaid syntax." }
}

function preparedFallback(fence: MarkdownMermaidFence, error: unknown): PreparedMarkdownDiagramFallback {
  return Object.freeze({ kind: "fallback", ...fence, ...fallbackWarning(error) })
}

function preparedCollection(diagrams: readonly PreparedMarkdownDiagram[]): PreparedMarkdownDiagrams {
  return Object.freeze({
    version: 1 as const,
    byKey: Object.freeze(Object.fromEntries(diagrams.map((diagram) => [diagram.key, diagram]))),
  })
}

export function createMarkdownDiagramFallbacks(content: string, warning: string): PreparedMarkdownDiagrams {
  return preparedCollection(
    collectMarkdownMermaidFences(content).map((fence) =>
      Object.freeze({ kind: "fallback" as const, ...fence, warning }),
    ),
  )
}

export function findPreparedMarkdownDiagram(
  prepared: PreparedMarkdownDiagrams | undefined,
  sourceText: string,
  metadata: Pick<MarkdownMermaidFence, "title" | "caption"> = {},
): PreparedMarkdownDiagram | undefined {
  return prepared?.byKey[markdownMermaidAssetKey(sourceText, metadata)]
}

export async function prepareMarkdownDiagrams(
  content: string,
  { renderer, rasterizer, signal }: PrepareMarkdownDiagramsOptions,
): Promise<PreparedMarkdownDiagrams> {
  const limits = resolveEditorialLimits()
  const diagrams: PreparedMarkdownDiagram[] = []

  for (const fence of collectMarkdownMermaidFences(content)) {
    assertNotAborted(signal)
    try {
      const vector = await renderer.render(
        {
          id: fence.key,
          kind: "mermaid",
          sourceText: fence.sourceText,
          title: fence.title,
          description: fence.caption,
          caption: fence.caption,
        },
        { limits, signal },
      )
      if (vector.kind !== "vector") throw new EditorialRenderError("INVALID_SVG", "Mermaid renderer did not return SVG")
      const raster = await rasterizer.rasterize(vector, { limits, signal }, { scale: 300 / 96 })
      assertNotAborted(signal)
      diagrams.push(
        Object.freeze({
          kind: "image",
          ...fence,
          title: fence.title ?? raster.title,
          pngDataUri: `data:image/png;base64,${bytesToBase64(raster.bytes)}`,
          pixelWidth: raster.width,
          pixelHeight: raster.height,
          rendererId: raster.rendererId,
          sourceHash: raster.sourceHash,
          description: raster.description,
          warnings: Object.freeze([...raster.warnings]),
        }),
      )
    } catch (error) {
      if (error instanceof EditorialRenderError && error.code === "ABORTED") throw error
      diagrams.push(preparedFallback(fence, error))
    }
  }

  return preparedCollection(diagrams)
}

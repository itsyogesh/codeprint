import type { EditorialLimits } from "./limits"
import { EditorialRenderError } from "./limits"

export const BEAUTIFUL_MERMAID_FAMILIES = ["flowchart", "state", "sequence", "class", "er"] as const
export const DETECTED_BEAUTIFUL_MERMAID_FAMILIES = [...BEAUTIFUL_MERMAID_FAMILIES, "xy"] as const

export type BeautifulMermaidFamily = (typeof BEAUTIFUL_MERMAID_FAMILIES)[number]
export type DetectedBeautifulMermaidFamily = (typeof DETECTED_BEAUTIFUL_MERMAID_FAMILIES)[number]

const FAMILY_SIGNATURES: readonly [DetectedBeautifulMermaidFamily, RegExp][] = [
  ["flowchart", /^(?:flowchart|graph)(?:\s+|$)/i],
  ["state", /^stateDiagram(?:-v2)?(?:\s+|$)/i],
  ["sequence", /^sequenceDiagram(?:\s+|$)/i],
  ["class", /^classDiagram(?:\s+|$)/i],
  ["er", /^erDiagram(?:\s+|$)/i],
  ["xy", /^xychart(?:-beta)?(?:\s+|$)/i],
]

function firstMeaningfulMermaidLine(source: string): string {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0 || trimmed.startsWith("%%")) continue
    return trimmed
  }
  return ""
}

export function detectBeautifulMermaidFamily(source: string): DetectedBeautifulMermaidFamily | null {
  const firstLine = firstMeaningfulMermaidLine(source)
  for (const [family, signature] of FAMILY_SIGNATURES) {
    if (signature.test(firstLine)) return family
  }
  return null
}

export function requireBeautifulMermaidFamily(source: string): BeautifulMermaidFamily {
  const family = detectBeautifulMermaidFamily(source)
  if (!family || family === "xy") {
    throw new EditorialRenderError(
      "UNSUPPORTED_DIAGRAM",
      family === "xy"
        ? "XY charts are excluded from the first print-safe Mermaid release"
        : "This Mermaid diagram is outside the print-safe Beautiful Mermaid subset",
      {
        family: family ?? "unknown",
        fallback: "code",
        phase: 1,
      },
    )
  }
  return family
}

export interface MermaidComplexity {
  nodes: number
  edges: number
}

const EDGE_PATTERNS: Readonly<Record<BeautifulMermaidFamily, RegExp>> = {
  flowchart: /(?:<-->|-->|---|-\.->|==>|~~~)/g,
  state: /-->/g,
  sequence: /(?:--?>{1,2}|--?x|--?\))/g,
  class: /(?:<\|--|--\|>|\*--|--\*|o--|--o|\.\.|-->|<--)/g,
  er: /(?:\|\||o\||\}o|\}\|)--(?:\|\||o\{|\|\{|\|o)/g,
}

const DECLARATION_PATTERNS: Readonly<Record<BeautifulMermaidFamily, RegExp>> = {
  flowchart: /^\s*[A-Za-z_][A-Za-z0-9_.-]*\s*(?:\[|\(|\{|$)/,
  state: /^\s*state\s+[A-Za-z_][A-Za-z0-9_.-]*/i,
  sequence: /^\s*(?:participant|actor)\s+[A-Za-z_][A-Za-z0-9_.-]*/i,
  class: /^\s*class\s+[A-Za-z_][A-Za-z0-9_.-]*/i,
  er: /^\s*[A-Za-z_][A-Za-z0-9_.-]*\s*\{\s*$/,
}

export function estimateMermaidComplexity(source: string, family: BeautifulMermaidFamily): MermaidComplexity {
  let edges = 0
  let declarations = 0
  for (const line of source.split(/\r?\n/)) {
    if (line.trimStart().startsWith("%%")) continue
    edges += [...line.matchAll(EDGE_PATTERNS[family])].length
    if (DECLARATION_PATTERNS[family].test(line)) declarations += 1
  }

  // Each edge can introduce at most two nodes. Explicit declarations cover
  // disconnected nodes. This intentionally errs on the conservative side.
  return { nodes: Math.max(declarations, edges * 2), edges }
}

export function renderedMermaidComplexity(svg: string): MermaidComplexity {
  const nodes = (svg.match(/class="(?:node|actor|class-node|entity)"/g) ?? []).length
  const edges = (svg.match(/class="(?:edge|message|class-relationship|er-relationship)"/g) ?? []).length
  return { nodes, edges }
}

export function assertMermaidComplexityWithinLimits(
  complexity: MermaidComplexity,
  limits: EditorialLimits,
  stage: "source" | "rendered",
): void {
  if (complexity.nodes > limits.maxDiagramNodes) {
    throw new EditorialRenderError("INPUT_TOO_LARGE", "Mermaid diagram exceeds the configured node limit", {
      actual: complexity.nodes,
      maximum: limits.maxDiagramNodes,
      stage,
    })
  }
  if (complexity.edges > limits.maxDiagramEdges) {
    throw new EditorialRenderError("INPUT_TOO_LARGE", "Mermaid diagram exceeds the configured edge limit", {
      actual: complexity.edges,
      maximum: limits.maxDiagramEdges,
      stage,
    })
  }
}

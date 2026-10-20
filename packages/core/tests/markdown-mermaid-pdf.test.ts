import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"
import { createCodeprintMermaidBlockRenderer, resvgBrowserRasterizer } from "../src/editorial/browser"
import { resvgNodeRasterizer } from "../src/editorial/node"
import {
  collectMarkdownMermaidFences,
  markdownMermaidAssetKey,
  prepareMarkdownDiagrams,
} from "../src/markdown-diagrams"
import { renderPrintablePdf } from "../src/render"

const hasPdfText = !spawnSync("pdftotext", ["-v"], { encoding: "utf8" }).error
const hasPdfImages = !spawnSync("pdfimages", ["-v"], { encoding: "utf8" }).error

function extractPdfText(bytes: Uint8Array): string {
  const extracted = spawnSync("pdftotext", ["-layout", "-", "-"], {
    input: Buffer.from(bytes),
    encoding: "utf8",
  })
  if (extracted.error) throw extracted.error
  if (extracted.status !== 0) throw new Error(extracted.stderr || "pdftotext failed")
  return extracted.stdout
}

function inspectPdfImages(bytes: Uint8Array): string {
  const inspected = spawnSync("pdfimages", ["-list", "-"], {
    input: Buffer.from(bytes),
    encoding: "utf8",
  })
  if (inspected.error) throw inspected.error
  if (inspected.status !== 0) throw new Error(inspected.stderr || "pdfimages failed")
  return inspected.stdout
}

function withoutWhitespace(value: string): string {
  return value.replace(/\s+/g, "")
}

describe("Markdown Mermaid fence collection", () => {
  it("collects nested Mermaid blocks", () => {
    const content = [
      "> Supporting material:",
      ">",
      '> ```mermaid title="Nested flow"',
      "> flowchart LR",
      "> A --> B",
      "> ```",
    ].join("\n")

    expect(collectMarkdownMermaidFences(content)).toEqual([
      expect.objectContaining({ title: "Nested flow", sourceText: "flowchart LR\nA --> B" }),
    ])
  })

  it("keeps identical source with distinct captions as distinct prepared assets", async () => {
    const source = "flowchart LR\nA --> B"
    const content = [
      '```mermaid caption="First caption"',
      source,
      "```",
      "",
      '```mermaid caption="Second caption"',
      source,
      "```",
    ].join("\n")
    const fences = collectMarkdownMermaidFences(content)

    expect(fences).toHaveLength(2)
    expect(fences[0]?.key).toBe(markdownMermaidAssetKey(source, { caption: "First caption" }))
    expect(fences[1]?.key).toBe(markdownMermaidAssetKey(source, { caption: "Second caption" }))
    expect(fences[0]?.key).not.toBe(fences[1]?.key)

    const prepared = await prepareMarkdownDiagrams(content, {
      renderer: createCodeprintMermaidBlockRenderer(),
      rasterizer: resvgNodeRasterizer,
    })
    expect(Object.values(prepared.byKey).map((asset) => asset.caption)).toEqual(["First caption", "Second caption"])
  })
})

describe("prepared Markdown Mermaid assets", () => {
  it("produces byte-identical prepared PNGs in Node and browser adapters", async () => {
    const content = '```mermaid title="Request flow"\nflowchart LR\nA[Input] --> B[Output]\n```'
    const renderer = createCodeprintMermaidBlockRenderer()
    const node = await prepareMarkdownDiagrams(content, { renderer, rasterizer: resvgNodeRasterizer })
    const browser = await prepareMarkdownDiagrams(content, { renderer, rasterizer: resvgBrowserRasterizer })
    const key = collectMarkdownMermaidFences(content)[0]?.key ?? ""
    const nodeAsset = node.byKey[key]
    const browserAsset = browser.byKey[key]

    expect(nodeAsset?.kind).toBe("image")
    expect(browserAsset?.kind).toBe("image")
    if (nodeAsset?.kind !== "image" || browserAsset?.kind !== "image") throw new Error("Expected image assets")
    expect(nodeAsset.pngDataUri.startsWith("data:image/png;base64,iVBORw0KGgo")).toBe(true)
    expect(nodeAsset.pngDataUri).toBe(browserAsset.pngDataUri)
    expect([nodeAsset.pixelWidth, nodeAsset.pixelHeight]).toEqual([browserAsset.pixelWidth, browserAsset.pixelHeight])
  })
})

describe.skipIf(!hasPdfText || !hasPdfImages)("actual Markdown Mermaid PDFs", () => {
  it.each([
    "portrait",
    "landscape",
  ] as const)("paginates tall diagrams and long metadata in %s", async (orientation) => {
    const caption = `${"A detailed explanation of the diagram. ".repeat(45)}Caption end marker.`
    const source = `flowchart TD\n${Array.from({ length: 22 }, (_, i) => `N${i}[Step ${i}] --> N${i + 1}[Step ${i + 1}]`).join("\n")}`
    const result = await renderPrintablePdf({
      content: `${"An introductory paragraph.\n\n".repeat(20)}\n\`\`\`mermaid title="Tall diagram" caption="${caption}"\n${source}\n\`\`\`\n\nDocument end marker.`,
      format: "markdown",
      filename: "tall-mermaid.md",
      orientation,
      margins: "wide",
    })
    const text = extractPdfText(result.bytes)
    expect(result.pages).toBeGreaterThan(1)
    expect(text).toContain("Caption end marker.")
    expect(text).toContain("Document end marker.")
    expect(inspectPdfImages(result.bytes)).toMatch(/\n\s*\d+\s+\d+\s+image\s+/)
    expect(text).not.toContain("Diagram not rendered")
  }, 20_000)

  it("embeds wide flowcharts, sequences and state diagrams in one document", async () => {
    const blocks = [
      "flowchart LR\nA[Read source] --> B[Prepare document] --> C[Preview pages] --> D[Print locally]",
      "sequenceDiagram\nUser->>Browser: Open document\nBrowser-->>User: Local preview",
      "stateDiagram-v2\n[*] --> Ready\nReady --> Printed\nPrinted --> [*]",
    ]
    const result = await renderPrintablePdf({
      content: blocks.map((source, i) => `\`\`\`mermaid title="Chart ${i + 1}"\n${source}\n\`\`\``).join("\n\n"),
      format: "markdown",
      filename: "multiple-mermaid.md",
      pageSize: "letter",
    })
    const text = extractPdfText(result.bytes)
    expect(text).toContain("Chart 1")
    expect(text).toContain("Chart 3")
    expect(text).not.toContain("Diagram not rendered")
    expect(inspectPdfImages(result.bytes).match(/\n\s*\d+\s+\d+\s+image\s+/g)?.length).toBe(3)
  })

  it("embeds supported Mermaid as an image without printing its source", async () => {
    const source = "flowchart LR\nInputNode[Input] --> OutputNode[Output]"
    const result = await renderPrintablePdf({
      content: `# Diagram\n\n\`\`\`mermaid title="Request flow" caption="Input reaches output."\n${source}\n\`\`\``,
      format: "markdown",
      filename: "supported-mermaid.md",
    })
    const text = extractPdfText(result.bytes)
    const images = inspectPdfImages(result.bytes)

    expect(text).toContain("Request flow")
    expect(text).toContain("Input reaches output.")
    expect(withoutWhitespace(text)).not.toContain(withoutWhitespace(source))
    expect(images).toMatch(/\n\s*\d+\s+\d+\s+image\s+/)
  })

  it("prints a concise warning and the original source for unsupported Mermaid", async () => {
    const source = "gantt\n  title Release plan\n  section Work\n  Build :done, a1, 2026-08-01, 1d"
    const result = await renderPrintablePdf({
      content: `# Unsupported\n\n\`\`\`mermaid\n${source}\n\`\`\``,
      format: "markdown",
      filename: "unsupported-mermaid.md",
    })
    const text = extractPdfText(result.bytes)

    expect(text).toContain("Diagram not rendered: this Mermaid diagram type is not supported yet.")
    expect(withoutWhitespace(text)).toContain(withoutWhitespace(source))
  })

  it("prints the source and a syntax warning when Mermaid parsing fails", async () => {
    const source = "sequenceDiagram\nA->>"
    const result = await renderPrintablePdf({
      content: `# Invalid\n\n\`\`\`mermaid\n${source}\n\`\`\``,
      format: "markdown",
      filename: "invalid-mermaid.md",
    })
    const text = extractPdfText(result.bytes)

    expect(text).toContain("Diagram not rendered: check the Mermaid syntax.")
    expect(withoutWhitespace(text)).toContain(withoutWhitespace(source))
  })
})

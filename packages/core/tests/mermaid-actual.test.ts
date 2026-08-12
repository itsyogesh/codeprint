import { describe, expect, it } from "vitest"
import {
  createBeautifulMermaidBlockRenderer,
  createCodeprintMermaidBlockRenderer,
  resolveEditorialLimits,
  stableEditorialHash,
  type VectorPrintAsset,
} from "../src/editorial"
import { resvgBrowserRasterizer } from "../src/editorial/browser"
import { resvgNodeRasterizer } from "../src/editorial/node"

const fixtures = {
  flowchart: {
    source: "flowchart LR\nA[Input] --> B[Output]",
    className: "node",
    hash: "fnv1a64:d0e5d4751b099f74",
  },
  state: {
    source: "stateDiagram-v2\n[*] --> Ready\nReady --> Done",
    className: "node",
    hash: "fnv1a64:807308b3c7c3a0e3",
  },
  sequence: {
    source: "sequenceDiagram\nparticipant A as Alice\nparticipant B as Bob\nA->>B: Hello",
    className: "actor",
    hash: "fnv1a64:7d7df8c556ee4651",
  },
  class: {
    source: "classDiagram\nclass Animal {\n +String name\n +speak()\n}\nclass Dog\nAnimal <|-- Dog",
    className: "class-node",
    hash: "fnv1a64:a9ff244d5eb183ee",
  },
  er: {
    source: "erDiagram\nCUSTOMER ||--o{ ORDER : places\nCUSTOMER {\n string name\n}\nORDER {\n int id PK\n}",
    className: "entity",
    hash: "fnv1a64:1bb731862b5462ca",
  },
} as const

const limits = resolveEditorialLimits()

async function renderFixture(name: keyof typeof fixtures): Promise<VectorPrintAsset> {
  const fixture = fixtures[name]
  const asset = await createCodeprintMermaidBlockRenderer().render(
    {
      id: name,
      kind: "mermaid",
      sourceText: fixture.source,
      title: `${name} golden`,
      description: `${name} fixture`,
    },
    { limits },
  )
  if (asset.kind !== "vector") throw new Error("Expected a vector Mermaid asset")
  return asset
}

describe("the pinned Beautiful Mermaid renderer", () => {
  it.each(
    Object.keys(fixtures) as Array<keyof typeof fixtures>,
  )("renders and normalizes the %s golden fixture", async (name) => {
    const fixture = fixtures[name]
    const asset = await renderFixture(name)

    expect(asset.svg).toContain(`class="${fixture.className}"`)
    expect(asset.svg).toContain('role="img"')
    expect(asset.svg).toContain(`aria-label="${name} golden"`)
    expect(asset.svg).toContain(`<title>${name} golden</title>`)
    expect(asset.svg).toContain(`<desc>${name} fixture</desc>`)
    expect(asset.svg).toContain('font-family="Mulish"')
    expect(asset.svg).not.toMatch(/<style\b|@import|fonts\.googleapis|color-mix|var\s*\(/i)
    expect(asset.svg).not.toMatch(/(?:href|url)\s*=?.*https?:/i)
    expect(asset.warnings).toEqual(expect.arrayContaining(["inline styles", "network styles and dynamic CSS"]))
    expect(stableEditorialHash(asset.svg)).toBe(fixture.hash)
  })

  it("restores the local monospace face for class and ER members after removing remote CSS", async () => {
    const classAsset = await renderFixture("class")
    const erAsset = await renderFixture("er")

    expect(classAsset.svg).toMatch(/<text[^>]*class="mono"[^>]*font-family="Source Code Pro"/)
    expect(erAsset.svg).toMatch(/<text[^>]*class="mono"[^>]*font-family="Source Code Pro"/)
  })

  it("sanitizes hostile labels and renderer style values without leaving invisible paint", async () => {
    const sourceText = [
      "flowchart LR",
      'A["<script>alert(1)</script>"] --> B[Safe]',
      "style A fill:url(https://attacker.example/a.svg),stroke:#000",
      "linkStyle 0 stroke:url(https://attacker.example/e.svg)",
    ].join("\n")
    const asset = await createCodeprintMermaidBlockRenderer().render(
      { id: "hostile", kind: "mermaid", sourceText, title: "Safe diagram", description: "Sanitized input" },
      { limits },
    )
    if (asset.kind !== "vector") throw new Error("Expected a vector Mermaid asset")

    expect(asset.svg).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
    expect(asset.svg).not.toMatch(/<script\b|https:\/\/attacker|javascript:|<foreignObject\b/i)
    expect(asset.svg).toContain('fill="#F8FAFC"')
    expect(asset.svg).toContain('stroke="#64748B"')
    expect(asset.warnings).toContain("external paint references")
  })

  it.each([
    ["xy", "xychart-beta\nx-axis [1, 2]\nline [1, 2]"],
    ["unknown", "gantt\n  title Schedule"],
  ])("returns a typed code fallback for %s diagrams", async (family, sourceText) => {
    await expect(
      createCodeprintMermaidBlockRenderer().render(
        { id: family, kind: "mermaid", sourceText, title: "Unsupported" },
        { limits },
      ),
    ).rejects.toMatchObject({
      code: "UNSUPPORTED_DIAGRAM",
      details: { family, fallback: "code", phase: 1 },
    })
  })

  it("enforces source node and edge budgets before layout", async () => {
    const renderer = createCodeprintMermaidBlockRenderer()
    await expect(
      renderer.render(
        { id: "nodes", kind: "mermaid", sourceText: "flowchart LR\nA[One]\nB[Two]\nC[Three]" },
        { limits: resolveEditorialLimits({ maxDiagramNodes: 2 }) },
      ),
    ).rejects.toMatchObject({ code: "INPUT_TOO_LARGE", details: { maximum: 2, stage: "source" } })

    await expect(
      renderer.render(
        { id: "edges", kind: "mermaid", sourceText: "flowchart LR\nA --> B --> C" },
        { limits: resolveEditorialLimits({ maxDiagramEdges: 1 }) },
      ),
    ).rejects.toMatchObject({ code: "INPUT_TOO_LARGE", details: { maximum: 1, stage: "source" } })
  })

  it("enforces rendered semantic-node budgets for injected renderers", async () => {
    const renderer = createBeautifulMermaidBlockRenderer(
      () =>
        '<svg viewBox="0 0 100 100"><g class="node"/><g class="node"/><g class="node"/><polyline class="edge"/></svg>',
    )
    await expect(
      renderer.render(
        { id: "rendered", kind: "mermaid", sourceText: "flowchart LR\nA --> B" },
        { limits: resolveEditorialLimits({ maxDiagramNodes: 2 }) },
      ),
    ).rejects.toMatchObject({ code: "INPUT_TOO_LARGE", details: { maximum: 2, stage: "rendered" } })
  })

  it("enforces normalized physical dimensions on actual package output", async () => {
    await expect(
      createCodeprintMermaidBlockRenderer().render(
        { id: "dimension", kind: "mermaid", sourceText: fixtures.flowchart.source },
        { limits: resolveEditorialLimits({ maxSvgDimension: 100 }) },
      ),
    ).rejects.toMatchObject({ code: "OUTPUT_TOO_LARGE" })
  })
})

describe("deterministic bundled resvg adapters", () => {
  it("produces byte-identical local PNGs in the Node and browser adapters", async () => {
    const vector = await renderFixture("flowchart")
    const context = { limits }
    const first = await resvgNodeRasterizer.rasterize(vector, context, { scale: 1 })
    const repeated = await resvgNodeRasterizer.rasterize(vector, context, { scale: 1 })
    const browser = await resvgBrowserRasterizer.rasterize(vector, context, { scale: 1 })

    expect(Array.from(first.bytes.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    expect(first.width).toBe(Math.round(vector.width))
    expect(first.height).toBe(Math.round(vector.height))
    expect(Buffer.from(first.bytes).equals(Buffer.from(repeated.bytes))).toBe(true)
    expect(Buffer.from(first.bytes).equals(Buffer.from(browser.bytes))).toBe(true)
    expect(first.title).toBe(vector.title)
    expect(first.description).toBe(vector.description)
  })

  it("rejects raster dimensions above the deterministic pixel budget", async () => {
    const vector = await renderFixture("flowchart")
    await expect(
      resvgNodeRasterizer.rasterize(vector, { limits: resolveEditorialLimits({ maxRasterPixels: 1_000 }) }),
    ).rejects.toMatchObject({ code: "OUTPUT_TOO_LARGE", details: { maximum: 1_000 } })
  })
})

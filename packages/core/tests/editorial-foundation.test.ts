import { describe, expect, it, vi } from "vitest"
import {
  CODEPRINT_EDITORIAL_FONTS,
  CODEPRINT_LIGHT_PALETTE,
  createBeautifulMermaidBlockRenderer,
  detectBeautifulMermaidFamily,
  type EditorialPalette,
  EditorialRenderError,
  type MermaidBlock,
  normalizeEditorialSvg,
  resolveEditorialLimits,
  stableEditorialHash,
} from "../src/editorial"

const limits = resolveEditorialLimits()

function mermaidBlock(sourceText: string, overrides: Partial<MermaidBlock> = {}): MermaidBlock {
  return {
    id: "diagram-1",
    kind: "mermaid",
    sourceText,
    ...overrides,
  }
}

describe("Beautiful Mermaid family detection", () => {
  it.each([
    ["flowchart LR\nA --> B", "flowchart"],
    ["graph TD\nA --> B", "flowchart"],
    ["stateDiagram-v2\n[*] --> Ready", "state"],
    ["sequenceDiagram\nAlice->>Bob: Hello", "sequence"],
    ["classDiagram\nClass01 <|-- AveryLongClass", "class"],
    ["erDiagram\nCUSTOMER ||--o{ ORDER : places", "er"],
    ["xychart-beta\nx-axis [1, 2]", "xy"],
    ["\uFEFF\n%% a comment\nflowchart TB\nA --> B", "flowchart"],
  ])("detects %s", (source, expected) => {
    expect(detectBeautifulMermaidFamily(source)).toBe(expected)
  })

  it.each([
    "",
    "pie\n  title Pets",
    "gantt\n  title Schedule",
    "mindmap\n root((Codeprint))",
  ])("does not misclassify unsupported syntax", (source) => {
    expect(detectBeautifulMermaidFamily(source)).toBeNull()
  })
})

describe("normalizeEditorialSvg", () => {
  it("removes remote CSS while retaining the diagram's local marker presentation and accessible metadata", () => {
    const raw = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"
      style="--bg:#fff;--fg:#111;background:var(--bg)" onload="steal()">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter');
        text { font-family: Inter; fill: var(--_text); }
      </style>
      <title>Untrusted title</title>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 8 2.5, 0 5" fill="var(--_arrow)" stroke="var(--_arrow)" />
        </marker>
      </defs>
      <polyline points="10,10 300,140" fill="none" stroke="var(--_line)" marker-end="url(#arrowhead)" />
      <text x="12" y="32" dy="4" fill="var(--_text)" font-style="italic">Safe &amp; printable</text>
    </svg>`

    const normalized = normalizeEditorialSvg(
      raw,
      { title: 'Architecture & "flow"', description: "A local-only Mermaid diagram." },
      { limits },
    )

    expect(normalized.width).toBe(320)
    expect(normalized.height).toBe(160)
    expect(normalized.svg).toContain('role="img"')
    expect(normalized.svg).toContain('aria-label="Architecture &amp; &quot;flow&quot;"')
    expect(normalized.svg).toContain("<title>Architecture &amp; &quot;flow&quot;</title>")
    expect(normalized.svg).toContain("<desc>A local-only Mermaid diagram.</desc>")
    expect(normalized.svg).toContain(`font-family="${CODEPRINT_EDITORIAL_FONTS.body}"`)
    expect(normalized.svg).toContain('marker-end="url(#arrowhead)"')
    expect(normalized.svg).toContain(`fill="${CODEPRINT_LIGHT_PALETTE.accent}"`)
    expect(normalized.svg).toContain(`stroke="${CODEPRINT_LIGHT_PALETTE.line}"`)
    expect(normalized.svg).toContain('dy="4"')
    expect(normalized.svg).toContain('font-style="italic"')
    expect(normalized.svg).not.toMatch(/@import|fonts\.googleapis|<style|onload|var\(|color-mix/i)
    expect(normalized.removed).toContain("network styles and dynamic CSS")
    expect(normalized.removed).toContain("event handlers")
  })

  it("resolves every public and derived Beautiful Mermaid palette variable to fixed colors", () => {
    const palette: EditorialPalette = {
      background: "#010101",
      foreground: "#020202",
      secondaryText: "#030303",
      mutedText: "#040404",
      faintText: "#050505",
      line: "#060606",
      accent: "#070707",
      surface: "#080808",
      border: "#090909",
      groupHeader: "#0A0A0A",
      keyBadge: "#0B0B0B",
    }
    const expected = new Map<string, string>([
      ["--bg", palette.background],
      ["--fg", palette.foreground],
      ["--line", palette.line],
      ["--accent", palette.accent],
      ["--muted", palette.mutedText],
      ["--surface", palette.surface],
      ["--border", palette.border],
      ["--_text", palette.foreground],
      ["--_text-sec", palette.secondaryText],
      ["--_text-muted", palette.mutedText],
      ["--_text-faint", palette.faintText],
      ["--_line", palette.line],
      ["--_arrow", palette.accent],
      ["--_node-fill", palette.surface],
      ["--_node-stroke", palette.border],
      ["--_group-fill", palette.background],
      ["--_group-hdr", palette.groupHeader],
      ["--_inner-stroke", palette.border],
      ["--_key-badge", palette.keyBadge],
    ])
    const probes = [...expected.keys()]
      .map((variable, index) => `<g data-probe-${index}="var(${variable})" />`)
      .join("")
    const normalized = normalizeEditorialSvg(
      `<svg viewBox="0 0 100 100">${probes}</svg>`,
      { title: "Palette probe" },
      { limits, palette },
    )

    for (const [index, expectedColor] of [...expected.values()].entries()) {
      expect(normalized.svg).toContain(`data-probe-${index}="${expectedColor}"`)
    }
    expect(normalized.svg).not.toMatch(/var\(|color-mix/i)
  })

  it("strips active content, foreign content, remote links, and remote paint references", () => {
    const raw = `<svg width="100" height="100" onpointerenter="steal()">
      <script>fetch('https://attacker.example')</script>
      <foreignObject><div>not SVG</div></foreignObject>
      <image href="https://attacker.example/pixel.png" width="1" height="1" />
      <a href="javascript:alert(1)"><text x="0" y="10">bad link</text></a>
      <g href="https://attacker.example"><rect width="20" height="20" fill="url(https://attacker.example/a.svg#paint)" /></g>
      <text x="0" y="40">kept</text>
    </svg>`

    const normalized = normalizeEditorialSvg(raw, { title: "Sanitized" }, { limits })

    expect(normalized.svg).toContain(">kept</text>")
    expect(normalized.svg).not.toMatch(/script|foreignObject|<image|<a\b|onpointerenter|attacker\.example|javascript:/i)
    expect(normalized.removed).toEqual(
      expect.arrayContaining([
        "a",
        "event handlers",
        "external hrefs",
        "external paint references",
        "foreignobject",
        "image",
        "script",
      ]),
    )
  })

  it.each([
    ["document types", '<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg width="1" height="1" />'],
    ["processing instructions", '<?xml-stylesheet href="https://attacker.example/x.css"?><svg width="1" height="1" />'],
    ["unknown elements", '<svg width="1" height="1"><use href="#payload" /></svg>'],
    ["unresolved palette values", '<svg width="1" height="1"><rect fill="var(--attacker-color)" /></svg>'],
    ["mismatched tags", '<svg width="1" height="1"><g></rect></svg>'],
  ])("rejects %s", (_label, raw) => {
    expect(() => normalizeEditorialSvg(raw, { title: "Unsafe" }, { limits })).toThrow(EditorialRenderError)
  })

  it("rejects excessive bytes, elements, and physical dimensions deterministically", () => {
    const byteLimits = resolveEditorialLimits({ maxOutputBytes: 100 })
    expect(() =>
      normalizeEditorialSvg(
        `<svg width="10" height="10"><text>${"x".repeat(200)}</text></svg>`,
        { title: "Large" },
        { limits: byteLimits },
      ),
    ).toThrowError(expect.objectContaining({ code: "OUTPUT_TOO_LARGE" }))

    const elementLimits = resolveEditorialLimits({ maxSvgElements: 2 })
    expect(() =>
      normalizeEditorialSvg(
        '<svg width="10" height="10"><g><rect width="1" height="1" /></g></svg>',
        { title: "Many" },
        { limits: elementLimits },
      ),
    ).toThrowError(expect.objectContaining({ code: "OUTPUT_TOO_LARGE" }))

    const dimensionLimits = resolveEditorialLimits({ maxSvgDimension: 500, maxSvgArea: 100_000 })
    expect(() =>
      normalizeEditorialSvg('<svg viewBox="0 0 1000 1000"></svg>', { title: "Huge" }, { limits: dimensionLimits }),
    ).toThrowError(expect.objectContaining({ code: "OUTPUT_TOO_LARGE" }))
  })
})

describe("the injected Beautiful Mermaid adapter", () => {
  it("renders through the injected function, normalizes the result, and produces a stable asset key", async () => {
    const injected = vi.fn(
      () =>
        '<svg viewBox="0 0 240 100" style="--bg:#fff"><style>@import url(https://example.test/font.css)</style><rect width="240" height="100" fill="var(--_node-fill)" /></svg>',
    )
    const renderer = createBeautifulMermaidBlockRenderer(injected, { rendererVersion: "1.1.3" })
    const block = mermaidBlock("flowchart LR\nA --> B", {
      title: "Build path",
      description: "Source moves from A to B.",
    })

    const first = await renderer.render(block, { limits })
    const second = await renderer.render(block, { limits })

    expect(renderer.supports(block)).toBe(true)
    expect(injected).toHaveBeenCalledWith(block.sourceText, {
      bg: CODEPRINT_LIGHT_PALETTE.background,
      fg: CODEPRINT_LIGHT_PALETTE.foreground,
      line: CODEPRINT_LIGHT_PALETTE.line,
      accent: CODEPRINT_LIGHT_PALETTE.accent,
      muted: CODEPRINT_LIGHT_PALETTE.mutedText,
      surface: CODEPRINT_LIGHT_PALETTE.surface,
      border: CODEPRINT_LIGHT_PALETTE.border,
      font: CODEPRINT_EDITORIAL_FONTS.body,
    })
    expect(first.kind).toBe("vector")
    expect(first.width).toBe(240)
    expect(first.height).toBe(100)
    expect(first.sourceHash).toBe(second.sourceHash)
    expect(first.sourceHash).toBe(
      stableEditorialHash(
        JSON.stringify({
          rendererId: "beautiful-mermaid",
          rendererVersion: "1.1.3",
          source: block.sourceText,
          family: "flowchart",
          palette: CODEPRINT_LIGHT_PALETTE,
          font: CODEPRINT_EDITORIAL_FONTS.body,
        }),
      ),
    )
    if (first.kind === "vector") {
      expect(first.svg).toContain(`font-family="${CODEPRINT_EDITORIAL_FONTS.body}"`)
      expect(first.svg).not.toMatch(/@import|https:\/\/example\.test|var\(/i)
    }
  })

  it("rejects unsupported input before invoking the injected renderer", async () => {
    const injected = vi.fn(() => '<svg width="1" height="1" />')
    const renderer = createBeautifulMermaidBlockRenderer(injected)

    await expect(renderer.render(mermaidBlock("pie\n  title Pets"), { limits })).rejects.toMatchObject({
      code: "UNSUPPORTED_DIAGRAM",
    })
    expect(injected).not.toHaveBeenCalled()
  })

  it("honors an already-aborted render signal", async () => {
    const controller = new AbortController()
    controller.abort()
    const injected = vi.fn(() => '<svg width="1" height="1" />')
    const renderer = createBeautifulMermaidBlockRenderer(injected)

    await expect(
      renderer.render(mermaidBlock("flowchart LR\nA --> B"), { limits, signal: controller.signal }),
    ).rejects.toMatchObject({ code: "ABORTED" })
    expect(injected).not.toHaveBeenCalled()
  })

  it("rejects source over the deterministic input limit", async () => {
    const injected = vi.fn(() => '<svg width="1" height="1" />')
    const renderer = createBeautifulMermaidBlockRenderer(injected)
    const smallLimits = resolveEditorialLimits({ maxInputCharacters: 12 })

    await expect(renderer.render(mermaidBlock("flowchart LR\nA --> B"), { limits: smallLimits })).rejects.toMatchObject(
      {
        code: "INPUT_TOO_LARGE",
        details: { maximum: 12 },
      },
    )
    expect(injected).not.toHaveBeenCalled()
  })
})

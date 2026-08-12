import type { MarkdownSettings } from "@codeprint/core"
import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const preview = vi.hoisted(() => ({ props: vi.fn() }))
const browserEditorial = vi.hoisted(() => ({
  loaded: vi.fn(),
  render: vi.fn(),
  rasterize: vi.fn(),
}))

vi.mock("@codeprint/core/pdf", () => ({
  finalizeMarkdownPdf: vi.fn(),
  PdfMarkdownDocument: () => null,
}))

vi.mock("@codeprint/core/editorial/browser", () => {
  browserEditorial.loaded()
  return {
    createCodeprintMermaidBlockRenderer: () => ({
      id: "test-mermaid",
      supports: () => true,
      render: browserEditorial.render,
    }),
    resvgBrowserRasterizer: {
      id: "test-rasterizer",
      rasterize: browserEditorial.rasterize,
    },
  }
})

vi.mock("@/components/pdf/actual-pdf-preview", () => ({
  default: (props: Record<string, unknown>) => {
    preview.props(props)
    return <div data-testid="actual-preview" data-ready={String(props.ready)} />
  },
}))

import MarkdownPdfPreview from "@/components/markdown/markdown-pdf-preview"

const settings: MarkdownSettings = {
  fontSize: 14,
  fontFamily: "Mulish",
  headingFont: "Merriweather",
  codeFont: "Source Code Pro",
  margins: "normal",
  showToc: false,
  codeBlockTheme: "light",
  pageSize: "a4",
  orientation: "portrait",
  showHeader: true,
}

function vectorAsset(sourceText: string) {
  return {
    kind: "vector" as const,
    format: "svg" as const,
    svg: '<svg viewBox="0 0 120 60"/>',
    width: 120,
    height: 60,
    rendererId: "test-mermaid",
    sourceHash: sourceText,
    title: "Flowchart diagram",
    description: "Test diagram",
    warnings: [],
  }
}

function rasterAsset(sourceHash: string) {
  return {
    kind: "raster" as const,
    format: "png" as const,
    bytes: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    width: 375,
    height: 188,
    rendererId: "test-rasterizer",
    sourceHash,
    title: "Flowchart diagram",
    description: "Test diagram",
    warnings: [],
  }
}

describe("MarkdownPdfPreview Mermaid preparation", () => {
  beforeEach(() => {
    preview.props.mockClear()
    browserEditorial.render.mockReset()
    browserEditorial.rasterize.mockReset()
  })

  it("keeps ordinary Markdown ready without importing the browser Mermaid renderer", async () => {
    render(<MarkdownPdfPreview content="# Ordinary" filename="ordinary.md" settings={settings} />)

    expect(screen.getByTestId("actual-preview")).toHaveAttribute("data-ready", "true")
    await Promise.resolve()
    expect(browserEditorial.loaded).not.toHaveBeenCalled()
  })

  it("gates the PDF until the lazily loaded Mermaid PNG is prepared", async () => {
    browserEditorial.render.mockImplementation(async (block: { sourceText: string }) => vectorAsset(block.sourceText))
    browserEditorial.rasterize.mockImplementation(async (asset: { sourceHash: string }) =>
      rasterAsset(asset.sourceHash),
    )

    render(
      <MarkdownPdfPreview
        content={'```mermaid title="Prepared"\nflowchart LR\nA --> B\n```'}
        filename="diagram.md"
        settings={settings}
      />,
    )

    expect(screen.getByTestId("actual-preview")).toHaveAttribute("data-ready", "false")
    await waitFor(() => expect(screen.getByTestId("actual-preview")).toHaveAttribute("data-ready", "true"))
    const latest = preview.props.mock.calls.at(-1)?.[0] as {
      document: { props: { preparedDiagrams?: { byKey: Record<string, { kind: string }> } } }
    }
    expect(browserEditorial.loaded).toHaveBeenCalledTimes(1)
    expect(Object.values(latest.document.props.preparedDiagrams?.byKey ?? {})).toEqual([
      expect.objectContaining({ kind: "image", title: "Prepared" }),
    ])
  })

  it("ignores stale diagram preparation after the Markdown changes", async () => {
    const pending = new Map<string, (asset: ReturnType<typeof vectorAsset>) => void>()
    browserEditorial.render.mockImplementation(
      (block: { sourceText: string }) =>
        new Promise((resolve) => {
          pending.set(block.sourceText, resolve)
        }),
    )
    browserEditorial.rasterize.mockImplementation(async (asset: { sourceHash: string }) =>
      rasterAsset(asset.sourceHash),
    )
    const firstSource = "flowchart LR\nA --> B"
    const secondSource = "flowchart LR\nX --> Y"
    const { rerender } = render(
      <MarkdownPdfPreview content={`\`\`\`mermaid\n${firstSource}\n\`\`\``} filename="stale.md" settings={settings} />,
    )
    await waitFor(() => expect(pending.has(firstSource)).toBe(true))

    rerender(
      <MarkdownPdfPreview content={`\`\`\`mermaid\n${secondSource}\n\`\`\``} filename="stale.md" settings={settings} />,
    )
    await waitFor(() => expect(pending.has(secondSource)).toBe(true))

    await act(async () => pending.get(firstSource)?.(vectorAsset(firstSource)))
    expect(screen.getByTestId("actual-preview")).toHaveAttribute("data-ready", "false")

    await act(async () => pending.get(secondSource)?.(vectorAsset(secondSource)))
    await waitFor(() => expect(screen.getByTestId("actual-preview")).toHaveAttribute("data-ready", "true"))
    const latest = preview.props.mock.calls.at(-1)?.[0] as {
      document: { props: { preparedDiagrams?: { byKey: Record<string, { sourceText: string }> } } }
    }
    expect(Object.values(latest.document.props.preparedDiagrams?.byKey ?? {}).map((asset) => asset.sourceText)).toEqual(
      [secondSource],
    )
  })
})

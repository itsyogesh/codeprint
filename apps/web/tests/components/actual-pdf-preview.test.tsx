import type { DocumentProps } from "@react-pdf/renderer"
import { render, screen, waitFor } from "@testing-library/react"
import type { ReactElement } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const reactPdf = vi.hoisted(() => ({
  instance: { blob: null as Blob | null, loading: false, error: null as string | null },
  update: vi.fn(),
}))

vi.mock("@react-pdf/renderer", () => ({
  usePDF: () => [reactPdf.instance, reactPdf.update],
}))

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="pdf-page-canvas" />,
}))

import ActualPdfPreview from "@/components/pdf/actual-pdf-preview"

describe("ActualPdfPreview", () => {
  beforeEach(() => {
    reactPdf.instance.blob = new Blob(["pdf"])
    reactPdf.update.mockClear()
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:http://localhost/preview"),
      revokeObjectURL: vi.fn(),
    })
  })

  it("expands to the full PDF page instead of creating a clipped vertical viewport", async () => {
    render(
      <ActualPdfPreview
        document={(<div />) as unknown as ReactElement<DocumentProps>}
        filename="guide.md"
        pageSize="a4"
        orientation="portrait"
        preparePdf={async (blob) => ({ blob, pageCount: 1 })}
      />,
    )

    const viewport = await waitFor(() => screen.getByTestId("pdf-page-canvas").parentElement)
    expect(viewport).toHaveAttribute("data-pdf-preview-viewport")
    expect(viewport).toHaveClass("overflow-x-auto")
    expect(viewport).not.toHaveClass("overflow-auto")
    expect(viewport?.className).not.toContain("max-h-")
  })
})

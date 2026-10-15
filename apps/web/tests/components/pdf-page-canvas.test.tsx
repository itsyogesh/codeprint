import { render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const reactPdf = vi.hoisted(() => ({
  documentProps: vi.fn(),
  pageProps: vi.fn(),
  pdfjs: { GlobalWorkerOptions: { workerSrc: "" } },
}))

vi.mock("react-pdf", () => ({
  pdfjs: reactPdf.pdfjs,
  Document: (props: Record<string, unknown> & { children?: React.ReactNode }) => {
    reactPdf.documentProps(props)
    return <div data-testid="pdf-document">{props.children}</div>
  },
  Page: (props: Record<string, unknown>) => {
    reactPdf.pageProps(props)
    return <canvas data-testid="pdf-page" aria-label={String(props["aria-label"])} />
  },
}))

import PdfPageCanvas from "@/components/pdf/pdf-page-canvas"

class ResizeObserverMock {
  observe() {}
  disconnect() {}
}

describe("PdfPageCanvas", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock)
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 720,
      height: 900,
      top: 0,
      right: 720,
      bottom: 900,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    reactPdf.documentProps.mockClear()
    reactPdf.pageProps.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("renders the selected page from the exact processed object URL", async () => {
    render(
      <PdfPageCanvas
        url="blob:http://localhost/processed-pdf"
        pageNumber={2}
        zoom="page-width"
        filename="guide.md"
        onDocumentLoad={vi.fn()}
        onError={vi.fn()}
      />,
    )

    await waitFor(() => expect(reactPdf.pageProps).toHaveBeenCalledWith(expect.objectContaining({ width: 720 })))
    expect(reactPdf.documentProps).toHaveBeenCalledWith(
      expect.objectContaining({ file: "blob:http://localhost/processed-pdf" }),
    )
    expect(reactPdf.pageProps).toHaveBeenCalledWith(
      expect.objectContaining({
        pageNumber: 2,
        renderTextLayer: false,
        renderAnnotationLayer: false,
        "aria-label": "Page 2 of guide.md",
      }),
    )
  })

  it("uses PDF scale for fixed zoom levels", () => {
    render(
      <PdfPageCanvas
        url="blob:http://localhost/processed-pdf"
        pageNumber={1}
        zoom={125}
        filename="guide.md"
        onDocumentLoad={vi.fn()}
        onError={vi.fn()}
      />,
    )

    expect(reactPdf.pageProps).toHaveBeenCalledWith(expect.objectContaining({ scale: 1.25 }))
    expect(reactPdf.documentProps).toHaveBeenCalledWith(expect.objectContaining({ className: "mx-auto shrink-0" }))
  })

  it.each([120, 194, 218, 272])("fits a %ipx phone preview without imposing a wider PDF page", async (width) => {
    const rect = HTMLElement.prototype.getBoundingClientRect()
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue({ ...rect, width })
    const { container } = render(
      <PdfPageCanvas
        url="blob:http://localhost/mobile-pdf"
        pageNumber={1}
        zoom="page-width"
        filename="mobile.md"
        onDocumentLoad={vi.fn()}
        onError={vi.fn()}
      />,
    )
    await waitFor(() => expect(reactPdf.pageProps).toHaveBeenCalledWith(expect.objectContaining({ width })))
    expect(container.querySelector("[data-pdf-page-container]")).toHaveClass("w-full")
    expect(container.querySelector("[data-pdf-page-container]")).not.toHaveClass("justify-center")
  })

  it("configures a bundled local PDF.js worker", () => {
    expect(reactPdf.pdfjs.GlobalWorkerOptions.workerSrc).toContain("pdf.worker.min.mjs")
    expect(reactPdf.pdfjs.GlobalWorkerOptions.workerSrc).not.toMatch(/unpkg|jsdelivr|cdnjs/)
  })
})

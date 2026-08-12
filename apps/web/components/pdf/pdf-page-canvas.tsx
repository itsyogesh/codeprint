"use client"

import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()

interface PdfPageCanvasProps {
  url: string
  pageNumber: number
  zoom: number | "page-width"
  filename: string
  onDocumentLoad: (pageCount: number) => void
  onError: (message: string) => void
}

function PageLoadingState() {
  return <div className="min-h-[580px] w-full max-w-3xl animate-pulse rounded-sm bg-white shadow-xl" />
}

export default function PdfPageCanvas({
  url,
  pageNumber,
  zoom,
  filename,
  onDocumentLoad,
  onError,
}: PdfPageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const measure = () => setContainerWidth(Math.floor(container.getBoundingClientRect().width))
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const pageSizing = zoom === "page-width" ? { width: Math.max(240, containerWidth) } : { scale: zoom / 100 }

  return (
    <div ref={containerRef} className="flex min-h-[580px] min-w-full justify-center" data-pdf-page-container>
      <Document
        file={url}
        loading={<PageLoadingState />}
        error={null}
        externalLinkTarget="_blank"
        onLoadSuccess={({ numPages }) => onDocumentLoad(numPages)}
        onLoadError={(error) => onError(error.message || "The PDF document could not be displayed.")}
      >
        <Page
          key={`${url}:${pageNumber}:${zoom}:${containerWidth}`}
          pageNumber={pageNumber}
          {...pageSizing}
          className="overflow-hidden rounded-sm bg-white shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
          canvasBackground="white"
          loading={<PageLoadingState />}
          error={null}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onRenderError={(error) => onError(error.message || "This PDF page could not be displayed.")}
          aria-label={`Page ${pageNumber} of ${filename}`}
        />
      </Document>
    </div>
  )
}

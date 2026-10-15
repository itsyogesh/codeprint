"use client"

import type { PageOrientation, PageSize } from "@codeprint/core"
import { type DocumentProps, usePDF } from "@react-pdf/renderer"
import { ChevronLeft, ChevronRight, FileText, Loader2, Minus, Plus, ScanLine } from "lucide-react"
import dynamic from "next/dynamic"
import { type ReactElement, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { PAGE_SIZES } from "@/lib/constants"
import { readPdfPageCount } from "@/lib/pdf"

const PdfPageCanvas = dynamic(() => import("@/components/pdf/pdf-page-canvas"), {
  ssr: false,
  loading: () => <div className="min-h-[580px] w-full max-w-3xl animate-pulse rounded-sm bg-white shadow-xl" />,
})

export interface PdfPreviewState {
  blob: Blob | null
  url: string | null
  pageCount: number | null
  loading: boolean
  error: string | null
}

export interface PreparedPdf {
  blob: Blob
  pageCount: number | null
}

interface ActualPdfPreviewProps {
  document: ReactElement<DocumentProps>
  filename: string
  pageSize: PageSize
  orientation: PageOrientation
  ready?: boolean
  preparePdf?: (source: Blob) => Promise<PreparedPdf>
  onStateChange?: (state: PdfPreviewState) => void
}

const ZOOM_LEVELS = [65, 80, 100, 125, 150]

const PAPER_LABELS: Record<PageSize, { name: string; dimensions: string }> = {
  a4: { name: "A4", dimensions: "210 × 297 mm" },
  letter: { name: "Letter", dimensions: "8.5 × 11 in" },
  legal: { name: "Legal", dimensions: "8.5 × 14 in" },
}

async function prepareGeneratedPdf(source: Blob): Promise<PreparedPdf> {
  return { blob: source, pageCount: await readPdfPageCount(source) }
}

export default function ActualPdfPreview({
  document,
  filename,
  pageSize,
  orientation,
  ready = true,
  preparePdf = prepareGeneratedPdf,
  onStateChange,
}: ActualPdfPreviewProps) {
  const [instance, updateInstance] = usePDF()
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [viewerError, setViewerError] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState<number | "page-width">("page-width")

  useEffect(() => {
    if (!ready) return
    updateInstance(document)
  }, [document, ready, updateInstance])

  useEffect(() => {
    let cancelled = false
    let nextUrl: string | null = null

    if (!instance.blob) {
      setPageCount(null)
      setProcessedBlob(null)
      setProcessedUrl(null)
      return () => {
        cancelled = true
      }
    }

    const preparePreview = async () => {
      setProcessing(true)
      setProcessingError(null)
      try {
        const prepared = await preparePdf(instance.blob!)
        nextUrl = URL.createObjectURL(prepared.blob)

        if (!cancelled) {
          setProcessedBlob(prepared.blob)
          setProcessedUrl(nextUrl)
          setPageCount(prepared.pageCount)
          setViewerError(null)
        }
      } catch (error) {
        console.error("Unable to prepare PDF preview:", error)
        if (!cancelled) {
          setPageCount(null)
          setProcessedBlob(null)
          setProcessedUrl(null)
          setProcessingError("The print preview could not be prepared.")
        }
      } finally {
        if (!cancelled) setProcessing(false)
      }
    }

    void preparePreview()
    return () => {
      cancelled = true
      if (nextUrl) URL.revokeObjectURL(nextUrl)
    }
  }, [instance.blob, preparePdf])

  useEffect(() => {
    if (pageCount && currentPage > pageCount) setCurrentPage(pageCount)
  }, [currentPage, pageCount])

  useEffect(() => {
    onStateChange?.({
      blob: processedBlob,
      url: processedUrl,
      pageCount,
      loading: !ready || instance.loading || processing,
      error: instance.error || processingError,
    })
  }, [
    instance.error,
    instance.loading,
    onStateChange,
    pageCount,
    processedBlob,
    processedUrl,
    processing,
    processingError,
    ready,
  ])

  const paper = PAPER_LABELS[pageSize]
  const rawDimensions = PAGE_SIZES[pageSize]
  const pageDimensions =
    orientation === "portrait" ? rawDimensions : { width: rawDimensions.height, height: rawDimensions.width }
  const isLoading = !ready || instance.loading || processing
  const previewError = instance.error || processingError || viewerError
  const pageStatus = useMemo(() => {
    if (isLoading) return "Paginating…"
    if (!pageCount) return "PDF"
    return `${pageCount} ${pageCount === 1 ? "page" : "pages"}`
  }, [isLoading, pageCount])

  const stepZoom = (direction: -1 | 1) => {
    const currentZoom = zoom === "page-width" ? 100 : zoom
    const currentIndex = ZOOM_LEVELS.reduce(
      (bestIndex, value, index) =>
        Math.abs(value - currentZoom) < Math.abs(ZOOM_LEVELS[bestIndex] - currentZoom) ? index : bestIndex,
      0,
    )
    const nextIndex = Math.min(ZOOM_LEVELS.length - 1, Math.max(0, currentIndex + direction))
    setZoom(ZOOM_LEVELS[nextIndex])
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner dark:border-white/[0.08] dark:bg-[#070b13]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3 dark:border-white/[0.08] dark:bg-slate-950 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600 shadow-[0_2px_0_#fed7aa] dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-400 dark:shadow-[0_2px_0_rgba(194,65,12,0.45)]">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="font-serif text-sm font-bold text-slate-950 dark:text-white">Print preview</h3>
              <span
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-600 dark:bg-white/[0.07] dark:text-slate-300"
                aria-live="polite"
              >
                {pageStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {paper.name} · {paper.dimensions} · {orientation === "portrait" ? "Portrait" : "Landscape"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Preview controls">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={isLoading || currentPage <= 1}
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[78px] text-center text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
            Page {currentPage} of {pageCount ?? "..."}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((page) => Math.min(pageCount ?? page, page + 1))}
            disabled={isLoading || !pageCount || currentPage >= pageCount}
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <span className="mx-0.5 h-6 w-px bg-slate-200 dark:bg-white/10" aria-hidden="true" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => stepZoom(-1)}
            disabled={isLoading}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[42px] text-center text-[11px] font-bold tabular-nums text-slate-500 dark:text-slate-400">
            {zoom === "page-width" ? "Fit" : `${zoom}%`}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => stepZoom(1)}
            disabled={isLoading}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5"
            onClick={() => setZoom("page-width")}
            disabled={isLoading}
            aria-pressed={zoom === "page-width"}
          >
            <ScanLine className="h-3.5 w-3.5" />
            Fit width
          </Button>
        </div>
      </div>

      <div
        className="relative min-h-[620px] overflow-hidden bg-slate-200/70 p-3 dark:bg-black/30 sm:p-5"
        aria-busy={isLoading}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-slate-200/85 backdrop-blur-[1px] dark:bg-slate-950/80">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              Laying out pages…
            </div>
          </div>
        )}

        {previewError ? (
          <div
            className="grid min-h-[580px] place-items-center rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
            role="alert"
          >
            The print preview could not be generated. Try changing the document or settings.
          </div>
        ) : processedUrl ? (
          <div
            className="min-h-[620px] w-full overflow-x-auto rounded-xl border border-slate-300 bg-slate-300/40 p-1 dark:border-white/10 dark:bg-black/20"
            data-pdf-preview-viewport
          >
            <PdfPageCanvas
              key={processedUrl}
              url={processedUrl}
              pageNumber={currentPage}
              zoom={zoom}
              filename={filename}
              onDocumentLoad={setPageCount}
              onError={setViewerError}
            />
          </div>
        ) : (
          <div
            className="mx-auto w-full max-w-3xl rounded-sm border border-slate-300 bg-white shadow-xl"
            style={{ aspectRatio: `${pageDimensions.width} / ${pageDimensions.height}` }}
          />
        )}
      </div>
    </div>
  )
}

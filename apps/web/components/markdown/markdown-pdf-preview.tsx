"use client"

import type { MarkdownSettings } from "@codeprint/core"
import {
  createMarkdownDiagramFallbacks,
  hasMarkdownMermaidFences,
  type PreparedMarkdownDiagrams,
  prepareMarkdownDiagrams,
} from "@codeprint/core/markdown"
import { finalizeMarkdownPdf, PdfMarkdownDocument } from "@codeprint/core/pdf"
import { useCallback, useEffect, useMemo, useState } from "react"
import ActualPdfPreview, { type PdfPreviewState, type PreparedPdf } from "@/components/pdf/actual-pdf-preview"

export type MarkdownPdfState = PdfPreviewState

interface MarkdownPdfPreviewProps {
  content: string
  filename: string
  settings: MarkdownSettings
  onStateChange?: (state: MarkdownPdfState) => void
}

export default function MarkdownPdfPreview({ content, filename, settings, onStateChange }: MarkdownPdfPreviewProps) {
  const containsMermaid = useMemo(() => hasMarkdownMermaidFences(content), [content])
  const [diagramPreparation, setDiagramPreparation] = useState<{
    content: string | null
    prepared?: PreparedMarkdownDiagrams
  }>({ content: containsMermaid ? null : content })
  const diagramsReady = !containsMermaid || diagramPreparation.content === content
  const preparedDiagrams = containsMermaid && diagramsReady ? diagramPreparation.prepared : undefined

  useEffect(() => {
    if (!containsMermaid) return

    const controller = new AbortController()
    setDiagramPreparation((current) => (current.content === content ? current : { content: null }))

    const prepare = async () => {
      try {
        const { createCodeprintMermaidBlockRenderer, resvgBrowserRasterizer } = await import(
          "@codeprint/core/editorial/browser"
        )
        const prepared = await prepareMarkdownDiagrams(content, {
          renderer: createCodeprintMermaidBlockRenderer(),
          rasterizer: resvgBrowserRasterizer,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) setDiagramPreparation({ content, prepared })
      } catch {
        if (controller.signal.aborted) return
        setDiagramPreparation({
          content,
          prepared: createMarkdownDiagramFallbacks(
            content,
            "Diagram not rendered: the Mermaid renderer was unavailable.",
          ),
        })
      }
    }

    void prepare()
    return () => controller.abort()
  }, [containsMermaid, content])

  const document = useMemo(
    () => (
      <PdfMarkdownDocument
        content={content}
        filename={filename}
        settings={settings}
        preparedDiagrams={preparedDiagrams}
      />
    ),
    [content, filename, preparedDiagrams, settings],
  )
  const preparePdf = useCallback(
    async (source: Blob): Promise<PreparedPdf> => {
      const finalized = await finalizeMarkdownPdf({
        bytes: await source.arrayBuffer(),
        filename,
        settings,
      })

      return {
        blob: new Blob([new Uint8Array(finalized.bytes).buffer], { type: "application/pdf" }),
        pageCount: finalized.pageCount,
      }
    },
    [filename, settings],
  )

  return (
    <ActualPdfPreview
      document={document}
      filename={filename}
      pageSize={settings.pageSize}
      orientation={settings.orientation}
      ready={diagramsReady}
      preparePdf={preparePdf}
      onStateChange={onStateChange}
    />
  )
}

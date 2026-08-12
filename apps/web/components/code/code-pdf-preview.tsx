"use client"

import type { CodeSettings } from "@codeprint/core"
import { hljs, loadLanguage } from "@codeprint/core/highlight"
import { PdfCodeDocument } from "@codeprint/core/pdf"
import { useEffect, useMemo, useState } from "react"
import ActualPdfPreview, { type PdfPreviewState } from "@/components/pdf/actual-pdf-preview"
import { safeHighlight } from "@/lib/utils"

interface CodePdfPreviewProps {
  code: string
  language: string
  filename: string
  settings: CodeSettings
  onStateChange?: (state: PdfPreviewState) => void
}

interface HighlightedCode {
  key: string
  html: string
}

export default function CodePdfPreview({ code, language, filename, settings, onStateChange }: CodePdfPreviewProps) {
  const highlightKey = `${language}\u0000${code}`
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null)

  useEffect(() => {
    if (!settings.colorized) return

    let cancelled = false
    const highlight = async () => {
      await loadLanguage(language)
      if (!cancelled) {
        setHighlighted({ key: highlightKey, html: safeHighlight(code, language, hljs) })
      }
    }

    void highlight()
    return () => {
      cancelled = true
    }
  }, [code, highlightKey, language, settings.colorized])

  const highlightedCode = settings.colorized && highlighted?.key === highlightKey ? highlighted.html : undefined
  const document = useMemo(
    () => (
      <PdfCodeDocument
        code={code}
        language={language}
        filename={filename}
        settings={settings}
        highlightedCode={highlightedCode}
      />
    ),
    [code, filename, highlightedCode, language, settings],
  )

  return (
    <ActualPdfPreview
      document={document}
      filename={filename}
      pageSize={settings.pageSize}
      orientation={settings.orientation}
      ready={!settings.colorized || Boolean(highlightedCode)}
      onStateChange={onStateChange}
    />
  )
}

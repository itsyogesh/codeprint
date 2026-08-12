"use client"

import type { CSVSettings } from "@codeprint/core"
import { PdfCsvDocument } from "@codeprint/core/pdf"
import { useMemo } from "react"
import ActualPdfPreview, { type PdfPreviewState } from "@/components/pdf/actual-pdf-preview"

interface CsvPdfPreviewProps {
  code: string
  filename: string
  settings: CSVSettings
  onStateChange?: (state: PdfPreviewState) => void
}

export default function CsvPdfPreview({ code, filename, settings, onStateChange }: CsvPdfPreviewProps) {
  const document = useMemo(
    () => <PdfCsvDocument code={code} filename={filename} settings={settings} />,
    [code, filename, settings],
  )

  return (
    <ActualPdfPreview
      document={document}
      filename={filename}
      pageSize={settings.pageSize}
      orientation={settings.orientation}
      onStateChange={onStateChange}
    />
  )
}

"use client"

import type { CSVSettings } from "@codeprint/core"
import { Download, Printer, Settings2, Table2, Upload } from "lucide-react"
import dynamic from "next/dynamic"
import { useCallback, useMemo, useState } from "react"
import CSVSettingsPanel from "@/components/csv/csv-settings"
import type { PdfPreviewState } from "@/components/pdf/actual-pdf-preview"
import FileDropZone from "@/components/shared/file-drop-zone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { downloadPdfUrl, openPdfPrintDialog } from "@/lib/pdf"
import { debounce } from "@/lib/utils"

const CsvPdfPreview = dynamic(() => import("@/components/csv/csv-pdf-preview"), {
  ssr: false,
  loading: () => <div className="p-8 text-center italic text-slate-400 dark:text-slate-500">Loading preview...</div>,
})

const SAMPLE_CSV = `Name,Age,Email,Department,Salary
Alice Johnson,32,alice@example.com,Engineering,95000
Bob Smith,28,bob@example.com,Marketing,72000
Carol White,45,carol@example.com,Engineering,110000
David Brown,35,david@example.com,Sales,85000
Eve Davis,29,eve@example.com,Design,78000
Frank Wilson,41,frank@example.com,Engineering,105000
Grace Lee,33,grace@example.com,Marketing,76000`

export default function CsvPrinterApp() {
  const [code, setCode] = useState("")
  const [debouncedCode, setDebouncedCode] = useState("")
  const [filename, setFilename] = useState("data.csv")
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [pdfState, setPdfState] = useState<PdfPreviewState>({
    blob: null,
    url: null,
    pageCount: null,
    loading: false,
    error: null,
  })
  const [settings, setSettings] = useState<CSVSettings>({
    hasHeaderRow: true,
    alternatingColors: true,
    fontSize: 12,
    pageSize: "a4",
    orientation: "portrait",
    showHeader: true,
  })
  const { toast } = useToast()

  const debouncedSetCode = useMemo(() => debounce((value: string) => setDebouncedCode(value), 300), [])

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value)
      debouncedSetCode(value)
    },
    [debouncedSetCode],
  )

  const handlePrint = async () => {
    if (!pdfState.url || pdfState.loading) return
    setIsPrinting(true)
    try {
      openPdfPrintDialog(pdfState.url)
    } catch (error) {
      console.error("Error printing:", error)
      toast({ title: "Error", description: "Failed to print. Please try again.", variant: "destructive" })
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!pdfState.url || pdfState.loading) return
    setIsDownloading(true)
    try {
      downloadPdfUrl(pdfState.url, filename)

      toast({
        title: "PDF downloaded",
        description: `${pdfState.pageCount ?? "Your"} ${pdfState.pageCount === 1 ? "page" : "pages"} saved with the previewed layout.`,
        variant: "success",
        duration: 8000,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({ title: "Error", description: "Failed to generate PDF. Please try again.", variant: "destructive" })
    } finally {
      setIsDownloading(false)
    }
  }

  const loadSample = () => {
    setCode(SAMPLE_CSV)
    setDebouncedCode(SAMPLE_CSV)
  }

  const showPreview = debouncedCode.trim().length > 0

  return (
    <section
      id="csv-editor-section"
      aria-label="CSV viewer and PDF editor"
      className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16"
    >
      <div className="mx-auto max-w-5xl">
        {/* Editor */}
        <div className="mb-8">
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.01]">
              <div className="flex gap-2" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{filename || "untitled.csv"}</span>
              <span className="rounded border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-orange-500/80">
                TABLE VIEW
              </span>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Table2 className="h-5 w-5 text-orange-500" />
                  <h2 className="font-serif text-xl font-bold">CSV input</h2>
                </div>
                {!code && (
                  <Button variant="outline" size="sm" onClick={loadSample}>
                    Load sample
                  </Button>
                )}
              </div>
              <FileDropZone
                accept={[".csv", ".tsv", ".txt"]}
                onFileDrop={({ content: text, filename: name }) => {
                  handleCodeChange(text)
                  setFilename(name)
                }}
              >
                {({ openFilePicker }) => (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csv-filename" className="mb-2 block">
                        Filename
                      </Label>
                      <div className="flex min-w-0 gap-2">
                        <Input
                          id="csv-filename"
                          value={filename}
                          onChange={(e) => setFilename(e.target.value)}
                          className="min-w-0 flex-1 font-mono"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={openFilePicker}
                          className="shrink-0 px-3 text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                        >
                          <Upload className="h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      placeholder={`Name,Age,Email\nJohn Doe,30,john@example.com\nJane Smith,25,jane@example.com`}
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      className="min-h-[320px] resize-y border-slate-200 bg-slate-50 font-mono text-sm leading-relaxed focus-visible:ring-orange-500 dark:border-white/[0.08] dark:bg-[#080c15]"
                    />
                  </div>
                )}
              </FileDropZone>
            </div>
          </Card>
        </div>

        {/* Preview */}
        {showPreview && (
          <div>
            <Card className="rounded-2xl border-slate-200 bg-white p-6 shadow-xl dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-serif text-xl font-bold">Preview</h2>

                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[90vw] max-w-96 p-4 sm:w-96">
                      <CSVSettingsPanel settings={settings} setSettings={setSettings} />
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={handlePrint}
                    disabled={!pdfState.url || pdfState.loading || isPrinting}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {isPrinting ? "Printing..." : "Print"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    disabled={!pdfState.url || pdfState.loading || isDownloading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? "Preparing..." : "PDF"}
                  </Button>
                </div>
              </div>

              <CsvPdfPreview code={debouncedCode} settings={settings} filename={filename} onStateChange={setPdfState} />
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}

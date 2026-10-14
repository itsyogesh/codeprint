"use client"

import type { CodeSettings } from "@codeprint/core"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Download, Edit, Eye, FileCode2, Printer, Settings2, Upload } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import CodeEditor from "@/components/code-editor"
import type { PdfPreviewState } from "@/components/pdf/actual-pdf-preview"
import PrintSettings from "@/components/print-settings"
import FileDropZone from "@/components/shared/file-drop-zone"
import { WebMcpReview } from "@/components/shared/webmcp-review"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useWebMcpDocument } from "@/hooks/use-webmcp-document"
import { downloadPdfUrl, openPdfPrintDialog } from "@/lib/pdf"
import { debounce } from "@/lib/utils"

// Keep React PDF and syntax highlighting out of the initial editor bundle.
const CodePdfPreview = dynamic(() => import("@/components/code/code-pdf-preview"), {
  ssr: false,
  loading: () => <div className="text-slate-400 dark:text-slate-500 italic p-8 text-center">Loading preview...</div>,
})

interface CodePrinterAppProps {
  initialLanguage?: string
  initialFilename?: string
  initialCode?: string
}

export default function CodePrinterApp({
  initialLanguage = "javascript",
  initialFilename = "code.js",
  initialCode = "",
}: CodePrinterAppProps = {}) {
  const [code, setCode] = useState(initialCode)
  const [debouncedCode, setDebouncedCode] = useState(initialCode)
  const [language, setLanguage] = useState(initialLanguage)
  const [filename, setFilename] = useState(initialFilename)
  const [isEditing, setIsEditing] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [pdfState, setPdfState] = useState<PdfPreviewState>({
    blob: null,
    url: null,
    pageCount: null,
    loading: false,
    error: null,
  })
  const [settings, setSettings] = useState<CodeSettings>({
    lineNumbers: true,
    columns: 1,
    fontSize: 12,
    orientation: "portrait",
    colorized: true,
    pageSize: "a4",
    showHeader: true,
  })
  const { toast } = useToast()
  const reduceMotion = useReducedMotion()

  const debouncedSetCode = useMemo(() => debounce((value: string) => setDebouncedCode(value), 300), [])
  const showPreview = debouncedCode.trim().length > 0
  const webMcp = useWebMcpDocument({
    format: "code",
    preview: pdfState,
    onAccept: (document) => {
      setCode(document.content)
      debouncedSetCode(document.content)
      setFilename(document.filename)
      if (document.language) setLanguage(document.language)
      setIsEditing(false)
      setPdfState({ blob: null, url: null, pageCount: null, loading: true, error: null })
      setSettings((current) => ({
        ...current,
        pageSize: document.pageSize ?? current.pageSize,
        orientation: document.orientation ?? current.orientation,
      }))
    },
  })

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value)
      debouncedSetCode(value)
    },
    [debouncedSetCode],
  )

  useEffect(() => {
    const extension = filename.split(".").pop()?.toLowerCase() || ""
    const extensionMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      cs: "csharp",
      cpp: "cpp",
      c: "c",
      go: "go",
      rs: "rust",
      php: "php",
      rb: "ruby",
      swift: "swift",
      kt: "kotlin",
      html: "html",
      css: "css",
      sql: "sql",
      sh: "shell",
      bash: "shell",
      json: "json",
      r: "r",
      dart: "dart",
      scala: "scala",
      md: "markdown",
      markdown: "markdown",
      csv: "csv",
    }
    if (extension in extensionMap) {
      setLanguage(extensionMap[extension])
    }
  }, [filename])

  const handlePrint = async () => {
    if (!pdfState.url || pdfState.loading) return
    setIsPrinting(true)
    try {
      openPdfPrintDialog(pdfState.url)
    } catch (error) {
      console.error("Error printing:", error)
      toast({
        title: "Error",
        description: "Failed to print. Please try again.",
        variant: "destructive",
      })
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
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <section id="editor-section" aria-label="Code to PDF editor" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <WebMcpReview {...webMcp} />
        {/* Code input section with a fixed minimum height to prevent CLS. */}
        <motion.div
          className="mb-8"
          initial={reduceMotion ? false : { opacity: 0, transform: "translateY(40px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0px)" }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.25, 0.8, 0.25, 1] }}
        >
          <Card className="min-h-[200px] overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.01]">
              <div className="flex gap-2" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{filename || "untitled"}</span>
              <span className="rounded border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-orange-500/80">
                EDITOR MODE
              </span>
            </div>
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-orange-500" />
                  <h2 className="font-serif text-xl font-bold">Code input</h2>
                </div>

                {isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (code) setIsEditing(false)
                    }}
                    disabled={!code}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <FileDropZone
                      onFileDrop={({ content, filename: name }) => {
                        handleCodeChange(content)
                        setFilename(name)
                      }}
                    >
                      {({ openFilePicker }) => (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="min-w-0 flex-1">
                              <Label htmlFor="filename" className="mb-2 block">
                                Filename
                              </Label>
                              <Input
                                id="filename"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                className="min-w-0 font-mono"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Label htmlFor="language" className="mb-2 block">
                                Language
                              </Label>
                              <CodeEditor.LanguageSelect id="language" language={language} setLanguage={setLanguage} />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={openFilePicker}
                              className="w-full shrink-0 px-3 text-slate-600 hover:text-slate-950 sm:w-auto dark:text-slate-300 dark:hover:text-white"
                            >
                              <Upload className="h-4 w-4" />
                              Upload
                            </Button>
                          </div>
                          <CodeEditor code={code} setCode={handleCodeChange} language={language} />
                        </div>
                      )}
                    </FileDropZone>
                  </motion.div>
                ) : (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                        <span className="font-medium">{filename}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {code.split("\n").length} lines &bull; {code.length} characters
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Markdown banner */}
        {language === "markdown" && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/30 dark:bg-orange-500/10">
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Markdown detected</p>
              <p className="mt-1 text-xs text-orange-700 dark:text-orange-400">
                For full markdown rendering with table of contents and custom fonts, try the dedicated Markdown Printer.
              </p>
            </div>
            <Link href="/markdown">
              <Button
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-500/40 dark:text-orange-300 dark:hover:bg-orange-500/10"
              >
                Open Markdown Printer
              </Button>
            </Link>
          </div>
        )}

        {/* Preview section uses transforms instead of height animation to prevent CLS. */}
        {showPreview && (
          <motion.div
            key="preview-section"
            initial={reduceMotion ? false : { opacity: 0, transform: "translateY(20px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <Card className="rounded-2xl border-slate-200 bg-white p-6 shadow-xl dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">Preview</h2>

                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[90vw] sm:w-96 max-w-96 p-4">
                      <PrintSettings settings={settings} setSettings={setSettings} />
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

              <CodePdfPreview
                code={debouncedCode}
                language={language}
                settings={settings}
                filename={filename}
                onStateChange={setPdfState}
              />
            </Card>
          </motion.div>
        )}
      </div>

      <div className="mt-6 text-center">
        <motion.p
          className="text-sm text-slate-500 dark:text-slate-400"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          Paste code. See it formatted. Export as PDF.
        </motion.p>
      </div>
    </section>
  )
}

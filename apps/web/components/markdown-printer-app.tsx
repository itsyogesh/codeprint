"use client"

import type { MarkdownSettings } from "@codeprint/core"
import { Download, FileText, Printer, Settings2, Upload } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import MarkdownPdfPreview, { type MarkdownPdfState } from "@/components/markdown/markdown-pdf-preview"
import MarkdownSettingsPanel from "@/components/markdown/markdown-settings"
import FileDropZone from "@/components/shared/file-drop-zone"
import { WebMcpReview } from "@/components/shared/webmcp-review"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useWebMcpDocument } from "@/hooks/use-webmcp-document"
import { downloadPdfUrl, openPdfPrintDialog } from "@/lib/pdf"
import { debounce } from "@/lib/utils"

const SAMPLE_MARKDOWN = `# Welcome to Markdown Printer

Write or paste your **markdown** content here and see it beautifully rendered for printing.

## Features

- Full GitHub Flavored Markdown support
- Syntax highlighted code blocks
- Table of contents generation
- Print-optimized output

## Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

## Table Example

| Feature | Status |
|---------|--------|
| Markdown | Done |
| CSV | Done |
| PDF | Done |

> This is a blockquote. It can contain **bold** text and \`inline code\`.
`

export default function MarkdownPrinterApp() {
  const [content, setContent] = useState("")
  const [debouncedContent, setDebouncedContent] = useState("")
  const [filename, setFilename] = useState("document.md")
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [pdfState, setPdfState] = useState<MarkdownPdfState>({
    blob: null,
    url: null,
    pageCount: null,
    loading: false,
    error: null,
  })
  const [settings, setSettings] = useState<MarkdownSettings>({
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
  })
  const { toast } = useToast()

  const debouncedSetContent = useMemo(() => debounce((value: string) => setDebouncedContent(value), 300), [])

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value)
      debouncedSetContent(value)
    },
    [debouncedSetContent],
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
    setContent(SAMPLE_MARKDOWN)
    setDebouncedContent(SAMPLE_MARKDOWN)
  }

  const showPreview = debouncedContent.trim().length > 0
  const webMcp = useWebMcpDocument({
    format: "markdown",
    preview: pdfState,
    onAccept: (document) => {
      handleContentChange(document.content)
      setFilename(document.filename)
      setPdfState({ blob: null, url: null, pageCount: null, loading: true, error: null })
      setSettings((current) => ({
        ...current,
        pageSize: document.pageSize ?? current.pageSize,
        orientation: document.orientation ?? current.orientation,
      }))
    },
  })

  return (
    <section
      id="md-editor-section"
      aria-label="Markdown to PDF editor"
      className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16"
    >
      <div className="mx-auto max-w-5xl">
        <WebMcpReview {...webMcp} />
        {/* Editor Section */}
        <div className="mb-8">
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.01]">
              <div className="flex gap-2" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{filename || "untitled.md"}</span>
              <span className="rounded border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-orange-500/80">
                MARKDOWN
              </span>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <h2 className="font-serif text-xl font-bold">Markdown input</h2>
                </div>
                {!content && (
                  <Button variant="outline" size="sm" onClick={loadSample}>
                    Load sample
                  </Button>
                )}
              </div>
              <FileDropZone
                accept={[".md", ".markdown", ".txt"]}
                onFileDrop={({ content: text, filename: name }) => {
                  handleContentChange(text)
                  setFilename(name)
                }}
              >
                {({ openFilePicker }) => (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="md-filename" className="mb-2 block">
                        Filename
                      </Label>
                      <div className="flex min-w-0 gap-2">
                        <Input
                          id="md-filename"
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
                      placeholder="Paste your markdown content here..."
                      value={content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="min-h-[320px] resize-y border-slate-200 bg-slate-50 font-mono text-sm leading-relaxed focus-visible:ring-orange-500 dark:border-white/[0.08] dark:bg-[#080c15]"
                    />
                  </div>
                )}
              </FileDropZone>
            </div>
          </Card>
        </div>

        {/* Preview Section */}
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
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="max-h-[min(72vh,640px)] w-[90vw] max-w-96 overflow-y-auto p-4 sm:w-96"
                    >
                      <MarkdownSettingsPanel settings={settings} setSettings={setSettings} />
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

              <MarkdownPdfPreview
                content={debouncedContent}
                settings={settings}
                filename={filename}
                onStateChange={setPdfState}
              />
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}

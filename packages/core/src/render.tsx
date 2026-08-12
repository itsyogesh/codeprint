import { renderToBuffer } from "@react-pdf/renderer"
import { PDFDocument } from "pdf-lib"
import { hljs, loadLanguage } from "./highlight"
import { assertPrintableInput, safePdfFilename, sourceFilename } from "./input"
import {
  createMarkdownDiagramFallbacks,
  hasMarkdownMermaidFences,
  type PreparedMarkdownDiagrams,
  prepareMarkdownDiagrams,
} from "./markdown-diagrams"
import { finalizeMarkdownPdf } from "./pdf/finalize-markdown-pdf"
import PdfCodeDocument from "./pdf/pdf-code-document"
import PdfCsvDocument from "./pdf/pdf-csv-document"
import PdfMarkdownDocument from "./pdf/pdf-markdown-document"
import { normalizeCodeSettings, normalizeCsvSettings, normalizeMarkdownSettings } from "./settings"
import type { CreatePrintablePdfInput, RenderedPdf } from "./types"

const LANGUAGE_ALIASES: Record<string, string> = {
  html: "xml",
  js: "javascript",
  shell: "bash",
  ts: "typescript",
}

async function pageCount(bytes: Uint8Array) {
  return (await PDFDocument.load(bytes)).getPageCount()
}

async function renderMarkdown(input: CreatePrintablePdfInput, filename: string) {
  const settings = normalizeMarkdownSettings(input)
  let preparedDiagrams: PreparedMarkdownDiagrams | undefined
  if (hasMarkdownMermaidFences(input.content)) {
    try {
      const { createCodeprintMermaidBlockRenderer, resvgNodeRasterizer } = await import("./editorial/node")
      preparedDiagrams = await prepareMarkdownDiagrams(input.content, {
        renderer: createCodeprintMermaidBlockRenderer(),
        rasterizer: resvgNodeRasterizer,
      })
    } catch {
      preparedDiagrams = createMarkdownDiagramFallbacks(
        input.content,
        "Diagram not rendered: the Mermaid renderer was unavailable.",
      )
    }
  }
  const contentPdf = await renderToBuffer(
    <PdfMarkdownDocument
      content={input.content}
      filename={filename}
      settings={settings}
      preparedDiagrams={preparedDiagrams}
    />,
  )
  return finalizeMarkdownPdf({ bytes: contentPdf, filename, settings })
}

async function renderCode(input: CreatePrintablePdfInput, filename: string) {
  const settings = normalizeCodeSettings(input)
  const language = input.language?.trim().toLowerCase() || "plaintext"
  const resolvedLanguage = LANGUAGE_ALIASES[language] ?? language
  await loadLanguage(resolvedLanguage)
  const highlightedCode =
    settings.colorized && hljs.getLanguage(resolvedLanguage)
      ? hljs.highlight(input.content, { language: resolvedLanguage, ignoreIllegals: true }).value
      : undefined
  const bytes = new Uint8Array(
    await renderToBuffer(
      <PdfCodeDocument
        code={input.content}
        language={resolvedLanguage}
        filename={filename}
        settings={settings}
        highlightedCode={highlightedCode}
      />,
    ),
  )
  return { bytes, pageCount: await pageCount(bytes) }
}

async function renderCsv(input: CreatePrintablePdfInput, filename: string) {
  const settings = normalizeCsvSettings(input)
  const bytes = new Uint8Array(
    await renderToBuffer(<PdfCsvDocument code={input.content} filename={filename} settings={settings} />),
  )
  return { bytes, pageCount: await pageCount(bytes) }
}

export async function renderPrintablePdf(input: CreatePrintablePdfInput): Promise<RenderedPdf> {
  assertPrintableInput(input)
  const filename = sourceFilename(input)
  const rendered =
    input.format === "markdown"
      ? await renderMarkdown(input, filename)
      : input.format === "csv"
        ? await renderCsv(input, filename)
        : await renderCode(input, filename)

  return {
    bytes: rendered.bytes,
    format: input.format,
    pages: rendered.pageCount,
    sourceFilename: filename,
    suggestedFilename: safePdfFilename(filename, input.format),
  }
}

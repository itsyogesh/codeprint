import type { CreatePrintablePdfInput } from "@codeprint/core"
import { renderPrintablePdf } from "@codeprint/core/render"
import { createPrintService, type PrintService } from "@codeprint/print"
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { DocumentStore } from "./documents"
import { getOutputDirectory, writeRenderedPdf } from "./output"
import { registerPreview } from "./preview-resource"

const formatSchema = z.enum(["markdown", "code", "csv"])
const pageSizeSchema = z.enum(["a4", "letter", "legal"])
const orientationSchema = z.enum(["portrait", "landscape"])
const duplexSchema = z.enum(["one-sided", "two-sided-long-edge", "two-sided-short-edge"])
const colorSchema = z.enum(["auto", "color", "monochrome"])

const documentInputSchema = {
  content: z.string().min(1).max(4_000_000).describe("Markdown, source code, or CSV text to turn into a PDF."),
  format: formatSchema.default("markdown").describe("For JSON, use code and set language to json."),
  filename: z.string().max(180).optional().describe("Source filename shown in the PDF header."),
  language: z.string().max(40).optional().describe("Programming language for code syntax highlighting."),
  pageSize: pageSizeSchema.default("a4"),
  orientation: orientationSchema.default("portrait"),
  fontSize: z.number().min(8).max(24).optional(),
  showHeader: z.boolean().default(true),
  margins: z.enum(["small", "normal", "wide"]).optional(),
  tableOfContents: z.boolean().optional(),
  codeTheme: z.enum(["light", "dark"]).optional(),
  lineNumbers: z.boolean().optional(),
  colorized: z.boolean().optional(),
  hasHeaderRow: z.boolean().optional(),
  alternatingColors: z.boolean().optional(),
  columns: z.union([z.literal(1), z.literal(2)]).optional(),
}

const printerSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  state: z.string(),
})

const printOptionsSchema = z.object({
  copies: z.number().int(),
  pageSize: pageSizeSchema,
  duplex: duplexSchema,
  color: colorSchema,
  pageRanges: z.string().optional(),
})

export interface CodeprintServerOptions {
  outputDirectory?: string
  printService?: PrintService
}

function errorResult(action: string, error: unknown) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred."
  console.error(`Codeprint MCP ${action} failed:`, error)
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: `Codeprint could not ${action}: ${message}` }],
  }
}

export function createCodeprintServer(options: CodeprintServerOptions = {}) {
  const outputDirectory = options.outputDirectory ?? getOutputDirectory()
  const printService = options.printService ?? createPrintService()
  const documents = new DocumentStore()
  const server = new McpServer(
    { name: "codeprint", version: "0.1.0" },
    {
      instructions:
        "Use Codeprint to create local PDFs from Markdown, source code, JSON, or CSV. Physical printing is a separate two-step flow: prepare_print_job returns the exact settings, then submit_print_job may only be called after the user explicitly approves those settings.",
    },
  )

  // Clear pending PDF snapshots on client disconnect, including stdio EOF.
  server.server.onclose = () => {
    printService.dispose()
    documents.dispose()
  }

  server.registerResource(
    "codeprint-defaults",
    "codeprint://defaults",
    {
      title: "Codeprint defaults",
      description: "Local output and print defaults used by Codeprint.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            { outputDirectory, pageSize: "a4", orientation: "portrait", format: "markdown" },
            null,
            2,
          ),
        },
      ],
    }),
  )

  server.registerResource(
    "codeprint-document",
    new ResourceTemplate("codeprint://documents/{documentId}", {
      list: async () => ({ resources: documents.list() }),
    }),
    { title: "Generated Codeprint PDFs", mimeType: "application/pdf" },
    async (uri, { documentId }) => {
      const document = documents.get(String(documentId))
      return {
        contents: [
          { uri: uri.href, mimeType: "application/pdf", blob: Buffer.from(document.bytes).toString("base64") },
        ],
      }
    },
  )

  const createTool = server.registerTool(
    "create_printable_pdf",
    {
      title: "Create a printable Codeprint PDF",
      description: "Create a paginated local PDF. Existing files are never overwritten.",
      inputSchema: documentInputSchema,
      outputSchema: {
        path: z.string(),
        uri: z.string(),
        format: formatSchema,
        pages: z.number().int().positive(),
        sizeBytes: z.number().int().nonnegative(),
        documentId: z.string().uuid(),
        resourceUri: z.string(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (input) => {
      try {
        const rendered = await renderPrintablePdf(input as CreatePrintablePdfInput)
        const result = await writeRenderedPdf(rendered, outputDirectory)
        const preview = documents.add(rendered)
        return {
          content: [
            { type: "text" as const, text: `Created a ${result.pages}-page PDF at ${result.path}` },
            {
              type: "resource_link" as const,
              uri: preview.resourceUri,
              name: result.path.split("/").pop() || "Codeprint PDF",
              title: "Open the Codeprint PDF",
              description: `${result.pages}-page printable ${result.format} document`,
              mimeType: "application/pdf",
              size: result.sizeBytes,
            },
          ],
          structuredContent: { ...result, ...preview },
        }
      } catch (error) {
        return errorResult("create the PDF", error)
      }
    },
  )

  const previewTool = server.registerTool(
    "preview_pdf",
    {
      title: "Preview a generated PDF",
      description:
        "Reopen a PDF created in this server session. Returns a readable PDF resource; clients supporting MCP Apps also show an inline viewer. Does not print.",
      inputSchema: { documentId: z.string().uuid() },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ documentId }) => {
      try {
        const document = documents.get(documentId)
        const resourceUri = `codeprint://documents/${documentId}`
        return {
          content: [
            {
              type: "resource_link" as const,
              uri: resourceUri,
              name: document.filename,
              mimeType: "application/pdf",
              size: document.bytes.byteLength,
            },
          ],
          structuredContent: { documentId, resourceUri, pages: document.pages, sizeBytes: document.bytes.byteLength },
        }
      } catch (error) {
        return errorResult("preview the PDF", error)
      }
    },
  )
  registerPreview(server, [createTool, previewTool])

  server.registerTool(
    "list_printers",
    {
      title: "List local printers",
      description: "List printers configured through the operating system. This does not submit a print job.",
      inputSchema: {},
      outputSchema: { printers: z.array(printerSchema) },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      try {
        const printers = await printService.listPrinters()
        return {
          content: [
            {
              type: "text" as const,
              text: printers.length
                ? printers.map((printer) => printer.name).join("\n")
                : "No printers are configured.",
            },
          ],
          structuredContent: { printers },
        }
      } catch (error) {
        return errorResult("list printers", error)
      }
    },
  )

  server.registerTool(
    "get_printer_capabilities",
    {
      title: "Get printer capabilities",
      description: "Read the paper, duplex, and color options reported by one printer.",
      inputSchema: { printerId: z.string().min(1) },
      outputSchema: {
        printer: printerSchema,
        pageSizes: z.array(z.string()),
        duplexModes: z.array(duplexSchema),
        colorModes: z.array(colorSchema),
        rawOptions: z.record(z.string(), z.array(z.string())),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ printerId }) => {
      try {
        const result = await printService.getCapabilities(printerId)
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          structuredContent: { ...result },
        }
      } catch (error) {
        return errorResult("read printer capabilities", error)
      }
    },
  )

  server.registerTool(
    "prepare_print_job",
    {
      title: "Prepare a local print job",
      description: "Validate a local PDF and return the exact printer settings for user review. This does not print.",
      inputSchema: {
        pdfPath: z.string().min(1),
        printerId: z.string().optional(),
        copies: z.number().int().min(1).max(99).default(1),
        pageSize: pageSizeSchema.default("a4"),
        duplex: duplexSchema.default("one-sided"),
        color: colorSchema.default("auto"),
        pageRanges: z.string().optional(),
      },
      outputSchema: {
        confirmationToken: z.string(),
        expiresAt: z.string(),
        pdfPath: z.string(),
        fileSizeBytes: z.number().int().nonnegative(),
        contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
        printer: printerSchema,
        options: printOptionsSchema,
        summary: z.string(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ pdfPath, printerId, copies, pageSize, duplex, color, pageRanges }) => {
      try {
        const prepared = await printService.prepare({
          pdfPath,
          options: { printerId, copies, pageSize, duplex, color, pageRanges },
        })
        return {
          content: [
            {
              type: "text" as const,
              text: `Prepared: ${prepared.summary}. Ask the user to approve these exact settings before calling submit_print_job.`,
            },
          ],
          structuredContent: { ...prepared, printer: { ...prepared.printer }, options: { ...prepared.options } },
        }
      } catch (error) {
        return errorResult("prepare the print job", error)
      }
    },
  )

  server.registerTool(
    "submit_print_job",
    {
      title: "Submit an approved local print job",
      description:
        "Send a prepared PDF to the physical printer. Call only after the user explicitly approves the prepared settings.",
      inputSchema: { confirmationToken: z.string().uuid() },
      outputSchema: {
        id: z.string(),
        printerId: z.string(),
        submittedAt: z.string(),
        rawOutput: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    async ({ confirmationToken }) => {
      try {
        const submitted = await printService.submit(confirmationToken)
        return {
          content: [{ type: "text" as const, text: `Submitted print job ${submitted.id}.` }],
          structuredContent: { ...submitted },
        }
      } catch (error) {
        return errorResult("submit the print job", error)
      }
    },
  )

  server.registerTool(
    "list_print_jobs",
    {
      title: "List local print jobs",
      description: "List incomplete print jobs reported by the operating system.",
      inputSchema: {},
      outputSchema: {
        jobs: z.array(
          z.object({
            id: z.string(),
            printerId: z.string(),
            state: z.enum(["pending", "processing", "completed", "cancelled", "unknown"]),
            owner: z.string().optional(),
            sizeBytes: z.number().optional(),
            submittedAt: z.string().optional(),
          }),
        ),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      try {
        const jobs = await printService.listJobs()
        return {
          content: [
            {
              type: "text" as const,
              text: jobs.length ? jobs.map((job) => job.id).join("\n") : "No incomplete print jobs.",
            },
          ],
          structuredContent: { jobs },
        }
      } catch (error) {
        return errorResult("list print jobs", error)
      }
    },
  )

  server.registerTool(
    "cancel_print_job",
    {
      title: "Cancel a local print job",
      description: "Cancel an incomplete print job by its operating-system job ID.",
      inputSchema: { jobId: z.string().min(1) },
      outputSchema: { cancelled: z.string() },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ jobId }) => {
      try {
        await printService.cancelJob(jobId)
        return {
          content: [{ type: "text" as const, text: `Cancelled print job ${jobId}.` }],
          structuredContent: { cancelled: jobId },
        }
      } catch (error) {
        return errorResult("cancel the print job", error)
      }
    },
  )

  return server
}

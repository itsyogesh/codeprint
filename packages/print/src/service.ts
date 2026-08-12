import { randomUUID } from "node:crypto"
import { open, stat } from "node:fs/promises"
import { resolve } from "node:path"
import type {
  PreparedPrintJob,
  PreparePrintJobInput,
  PrintBackend,
  Printer,
  PrinterCapabilities,
  PrintJob,
  PrintOptions,
  SubmittedPrintJob,
} from "./types"

const PREPARATION_TTL_MS = 5 * 60 * 1000
const PAGE_RANGE_PATTERN = /^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/

interface PendingJob {
  prepared: PreparedPrintJob
}

function normalizeOptions(options: PrintOptions | undefined): PreparedPrintJob["options"] {
  const copies = options?.copies ?? 1
  if (!Number.isInteger(copies) || copies < 1 || copies > 99) {
    throw new Error("Copies must be a whole number between 1 and 99.")
  }
  const pageRanges = options?.pageRanges?.replace(/\s+/g, "") || undefined
  if (pageRanges && !PAGE_RANGE_PATTERN.test(pageRanges)) {
    throw new Error("Page ranges must look like 1-3,5,8-10.")
  }
  if (pageRanges) {
    for (const range of pageRanges.split(",")) {
      const [start, end = start] = range.split("-").map(Number)
      if (start < 1 || end < start) throw new Error("Page ranges must contain positive, ascending page numbers.")
    }
  }
  return {
    copies,
    pageSize: options?.pageSize ?? "a4",
    duplex: options?.duplex ?? "one-sided",
    color: options?.color ?? "auto",
    pageRanges,
  }
}

async function assertPdfFile(pdfPath: string) {
  const absolutePath = resolve(pdfPath)
  const details = await stat(absolutePath)
  if (!details.isFile()) throw new Error(`${absolutePath} is not a file.`)
  const handle = await open(absolutePath, "r")
  try {
    const header = Buffer.alloc(5)
    await handle.read(header, 0, header.length, 0)
    if (header.toString("ascii") !== "%PDF-") throw new Error(`${absolutePath} is not a PDF file.`)
  } finally {
    await handle.close()
  }
  return { absolutePath, size: details.size }
}

function choosePrinter(printers: Printer[], requestedId: string | undefined) {
  if (!printers.length) throw new Error("No printers are configured on this computer.")
  if (requestedId) {
    const requested = printers.find((printer) => printer.id === requestedId)
    if (!requested) throw new Error(`Printer ${requestedId} is not available.`)
    return requested
  }
  return printers.find((printer) => printer.isDefault) ?? printers[0]
}

function supportsPageSize(reportedSizes: string[], requested: PreparedPrintJob["options"]["pageSize"]) {
  const patterns: Record<typeof requested, RegExp> = {
    a4: /(?:^|_)a4(?:\b|[._])/i,
    letter: /(?:^|_)(?:na_)?letter(?:\b|[._])/i,
    legal: /(?:^|_)(?:na_)?legal(?:\b|[._])/i,
  }
  return reportedSizes.some((size) => patterns[requested].test(size))
}

export class PrintService {
  readonly backend: PrintBackend
  private readonly pendingJobs = new Map<string, PendingJob>()

  constructor(backend: PrintBackend) {
    this.backend = backend
  }

  listPrinters(): Promise<Printer[]> {
    return this.backend.listPrinters()
  }

  getCapabilities(printerId: string): Promise<PrinterCapabilities> {
    return this.backend.getCapabilities(printerId)
  }

  listJobs(): Promise<PrintJob[]> {
    return this.backend.listJobs()
  }

  cancelJob(jobId: string): Promise<void> {
    if (!jobId.trim()) throw new Error("A print job ID is required.")
    return this.backend.cancelJob(jobId.trim())
  }

  async prepare(input: PreparePrintJobInput): Promise<PreparedPrintJob> {
    this.removeExpiredPreparations()
    const file = await assertPdfFile(input.pdfPath)
    const options = normalizeOptions(input.options)
    const printer = choosePrinter(await this.backend.listPrinters(), input.options?.printerId)
    const capabilities = await this.backend.getCapabilities(printer.id)
    if (capabilities.pageSizes.length > 0 && !supportsPageSize(capabilities.pageSizes, options.pageSize)) {
      throw new Error(`Printer ${printer.name} does not report support for ${options.pageSize.toUpperCase()} paper.`)
    }
    if (options.duplex !== "one-sided" && !capabilities.duplexModes.includes(options.duplex)) {
      throw new Error(`Printer ${printer.name} does not report support for ${options.duplex}.`)
    }
    if (options.color !== "auto" && !capabilities.colorModes.includes(options.color)) {
      throw new Error(`Printer ${printer.name} does not report support for ${options.color} printing.`)
    }
    const confirmationToken = randomUUID()
    const expiresAt = new Date(Date.now() + PREPARATION_TTL_MS).toISOString()
    const summary = [
      `${options.copies} ${options.copies === 1 ? "copy" : "copies"}`,
      options.pageSize.toUpperCase(),
      options.duplex,
      options.color,
      options.pageRanges ? `pages ${options.pageRanges}` : "all pages",
      `printer ${printer.name}`,
    ].join(", ")
    const prepared: PreparedPrintJob = {
      confirmationToken,
      expiresAt,
      pdfPath: file.absolutePath,
      fileSizeBytes: file.size,
      printer,
      options,
      summary,
    }
    this.pendingJobs.set(confirmationToken, { prepared })
    return prepared
  }

  async submit(confirmationToken: string): Promise<SubmittedPrintJob> {
    this.removeExpiredPreparations()
    const pending = this.pendingJobs.get(confirmationToken)
    if (!pending) throw new Error("The print confirmation is invalid or has expired. Prepare the job again.")
    this.pendingJobs.delete(confirmationToken)
    return this.backend.submit(pending.prepared.pdfPath, pending.prepared.printer, pending.prepared.options)
  }

  private removeExpiredPreparations() {
    const now = Date.now()
    for (const [token, pending] of this.pendingJobs) {
      if (Date.parse(pending.prepared.expiresAt) <= now) this.pendingJobs.delete(token)
    }
  }
}

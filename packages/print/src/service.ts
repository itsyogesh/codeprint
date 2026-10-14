import { createHash, randomUUID } from "node:crypto"
import { constants } from "node:fs"
import { open } from "node:fs/promises"
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
const MAX_PDF_BYTES = 32 * 1024 * 1024
const MAX_PENDING_BYTES = 64 * 1024 * 1024
const MAX_PREPARATIONS = 8
const VERIFICATION_CHUNK_BYTES = 64 * 1024

interface PendingJob {
  prepared: PreparedPrintJob
  bytes: Buffer
  device: bigint
  inode: bigint
  expiresAtMs: number
  timer: ReturnType<typeof setTimeout>
}

function normalizeOptions(options: PrintOptions | undefined): PreparedPrintJob["options"] {
  const copies = options?.copies ?? 1
  if (options?.pageSize !== undefined && !["a4", "letter", "legal"].includes(options.pageSize)) {
    throw new Error("Paper size must be a4, letter, or legal.")
  }
  if (
    options?.duplex !== undefined &&
    !["one-sided", "two-sided-long-edge", "two-sided-short-edge"].includes(options.duplex)
  ) {
    throw new Error("Invalid duplex mode.")
  }
  if (options?.color !== undefined && !["auto", "color", "monochrome"].includes(options.color)) {
    throw new Error("Invalid color mode.")
  }
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
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end < start)
        throw new Error("Page ranges must contain positive, ascending, safe whole page numbers.")
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

async function readPdfFile(
  pdfPath: string,
  capture?: { reserve: (size: number) => void; allocated: (bytes: Buffer) => void },
) {
  const absolutePath = resolve(pdfPath)
  // Open first: a pre-open stat would allow a symlink/file substitution race.
  // NONBLOCK prevents a FIFO from hanging before we can reject it with fstat.
  const handle = await open(absolutePath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
  let bytes: Buffer | undefined
  let retained = false
  try {
    const before = await handle.stat({ bigint: true })
    if (!before.isFile()) throw new Error(`${absolutePath} is not a regular file.`)
    if (before.size < 5n || before.size > BigInt(MAX_PDF_BYTES)) {
      throw new Error("PDF files must be between 5 bytes and 32 MiB.")
    }
    const size = Number(before.size)
    capture?.reserve(size)
    bytes = Buffer.alloc(capture ? size : Math.min(size, VERIFICATION_CHUNK_BYTES))
    capture?.allocated(bytes)
    let offset = 0
    const hash = createHash("sha256")
    while (offset < size) {
      const bufferOffset = capture ? offset : 0
      const { bytesRead } = await handle.read(
        bytes,
        bufferOffset,
        Math.min(bytes.length - bufferOffset, size - offset),
        offset,
      )
      if (!bytesRead) throw new Error("PDF changed while being read. Prepare the job again.")
      if (offset === 0 && (bytesRead < 5 || bytes.subarray(0, 5).toString("ascii") !== "%PDF-")) {
        throw new Error(`${absolutePath} is not a PDF file.`)
      }
      hash.update(bytes.subarray(bufferOffset, bufferOffset + bytesRead))
      offset += bytesRead
    }
    const after = await handle.stat({ bigint: true })
    if (before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) {
      throw new Error("PDF changed while being read. Prepare the job again.")
    }
    const contentSha256 = hash.digest("hex")
    retained = Boolean(capture)
    return { absolutePath, bytes, size, contentSha256, device: before.dev, inode: before.ino }
  } finally {
    if (!retained) bytes?.fill(0)
    await handle.close().catch((error: unknown) => {
      bytes?.fill(0)
      throw error
    })
  }
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
  readonly #pendingJobs = new Map<string, PendingJob>()
  readonly #preparingBuffers = new Set<Buffer>()
  readonly #checkingJobs = new Set<PendingJob>()
  readonly #activeJobs = new Set<PendingJob>()
  #preparing = 0
  #pendingBytes = 0
  #disposed = false

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
    if (this.#disposed) throw new Error("The print service has been disposed.")
    this.removeExpiredPreparations()
    if (this.#pendingJobs.size + this.#preparing + this.#activeJobs.size >= MAX_PREPARATIONS) {
      throw new Error("Too many pending print preparations. Discard a preparation first.")
    }
    const options = normalizeOptions(input.options)
    const requestedPrinterId = input.options?.printerId
    this.#preparing += 1
    let reservedBytes = 0
    let file: Awaited<ReturnType<typeof readPdfFile>> | undefined
    let retained = false
    try {
      let allocatedBuffer: Buffer | undefined
      try {
        file = await readPdfFile(input.pdfPath, {
          reserve: (size) => {
            if (this.#disposed) throw new Error("The print service has been disposed.")
            if (this.#pendingBytes + size > MAX_PENDING_BYTES)
              throw new Error("Pending print PDFs exceed the 64 MiB memory limit.")
            this.#pendingBytes += size
            reservedBytes = size
          },
          allocated: (bytes) => {
            allocatedBuffer = bytes
            this.#preparingBuffers.add(bytes)
          },
        })
      } catch (error) {
        if (allocatedBuffer) this.#preparingBuffers.delete(allocatedBuffer)
        throw error
      }
      if (this.#disposed) throw new Error("The print service has been disposed.")
      const printer = { ...choosePrinter(await this.backend.listPrinters(), requestedPrinterId) }
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
        contentSha256: file.contentSha256,
        printer: Object.freeze(printer),
        options: Object.freeze(options),
        summary,
      }
      if (this.#disposed) throw new Error("The print service has been disposed.")
      const expiresAtMs = Date.parse(expiresAt)
      const timer = setTimeout(() => this.discard(confirmationToken), PREPARATION_TTL_MS)
      timer.unref()
      this.#pendingJobs.set(confirmationToken, {
        prepared: Object.freeze(prepared),
        bytes: file.bytes,
        device: file.device,
        inode: file.inode,
        expiresAtMs,
        timer,
      })
      retained = true
      // The caller may edit its receipt, but cannot change the approved job.
      return { ...prepared, printer: { ...printer }, options: { ...options } }
    } finally {
      this.#preparing -= 1
      if (file) this.#preparingBuffers.delete(file.bytes)
      if (!retained) {
        file?.bytes.fill(0)
        this.#pendingBytes -= reservedBytes
      }
    }
  }

  async submit(confirmationToken: string): Promise<SubmittedPrintJob> {
    this.removeExpiredPreparations()
    const pending = this.#pendingJobs.get(confirmationToken)
    if (!pending) throw new Error("The print confirmation is invalid or has expired. Prepare the job again.")
    // Consume synchronously before any await: concurrent submissions cannot replay it.
    this.#pendingJobs.delete(confirmationToken)
    clearTimeout(pending.timer)
    this.#checkingJobs.add(pending)
    this.#activeJobs.add(pending)
    try {
      const current = await readPdfFile(pending.prepared.pdfPath)
      if (
        current.device !== pending.device ||
        current.inode !== pending.inode ||
        current.contentSha256 !== pending.prepared.contentSha256
      ) {
        throw new Error("PDF changed after preparation. Review it and prepare the job again.")
      }
      if (Date.now() >= pending.expiresAtMs)
        throw new Error("The print confirmation has expired. Prepare the job again.")
      if (this.#disposed) throw new Error("The print service has been disposed.")
      // Source changes after the check cannot affect CUPS: only the saved bytes
      // cross the backend boundary, never a filename that can be reopened.
      this.#checkingJobs.delete(pending)
      return await this.backend.submit(pending.bytes, pending.prepared.printer, pending.prepared.options)
    } finally {
      this.#checkingJobs.delete(pending)
      this.#activeJobs.delete(pending)
      pending.bytes.fill(0)
      this.#pendingBytes -= pending.bytes.byteLength
    }
  }

  discard(confirmationToken: string): void {
    const pending = this.#pendingJobs.get(confirmationToken)
    if (!pending) return
    this.#pendingJobs.delete(confirmationToken)
    clearTimeout(pending.timer)
    pending.bytes.fill(0)
    this.#pendingBytes -= pending.bytes.byteLength
  }

  dispose(): void {
    this.#disposed = true
    for (const token of this.#pendingJobs.keys()) this.discard(token)
    for (const bytes of this.#preparingBuffers) bytes.fill(0)
    for (const pending of this.#checkingJobs) pending.bytes.fill(0)
  }

  private removeExpiredPreparations() {
    const now = Date.now()
    for (const [token, pending] of this.#pendingJobs) {
      if (pending.expiresAtMs <= now) this.discard(token)
    }
  }
}

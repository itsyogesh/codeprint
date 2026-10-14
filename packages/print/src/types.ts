export type PrintJobState = "pending" | "processing" | "completed" | "cancelled" | "unknown"
export type DuplexMode = "one-sided" | "two-sided-long-edge" | "two-sided-short-edge"
export type PrintColorMode = "auto" | "color" | "monochrome"

export interface Printer {
  id: string
  name: string
  isDefault: boolean
  state: string
}

export interface PrinterCapabilities {
  printer: Printer
  pageSizes: string[]
  duplexModes: DuplexMode[]
  colorModes: PrintColorMode[]
  rawOptions: Record<string, string[]>
}

export interface PrintOptions {
  printerId?: string
  copies?: number
  pageSize?: "a4" | "letter" | "legal"
  duplex?: DuplexMode
  color?: PrintColorMode
  pageRanges?: string
}

export interface PreparePrintJobInput {
  pdfPath: string
  options?: PrintOptions
}

export interface PreparedPrintJob {
  confirmationToken: string
  expiresAt: string
  pdfPath: string
  fileSizeBytes: number
  contentSha256: string
  printer: Printer
  options: Required<Omit<PrintOptions, "printerId" | "pageRanges">> & Pick<PrintOptions, "pageRanges">
  summary: string
}

export interface SubmittedPrintJob {
  id: string
  printerId: string
  submittedAt: string
  rawOutput?: string
}

export interface PrintJob {
  id: string
  printerId: string
  state: PrintJobState
  owner?: string
  sizeBytes?: number
  submittedAt?: string
}

export interface PrintBackend {
  readonly name: string
  listPrinters(): Promise<Printer[]>
  getCapabilities(printerId: string): Promise<PrinterCapabilities>
  /** Consume the approved PDF bytes before resolving; never reopen the source path. */
  submit(pdfBytes: Uint8Array, printer: Printer, options: PreparedPrintJob["options"]): Promise<SubmittedPrintJob>
  listJobs(): Promise<PrintJob[]>
  cancelJob(jobId: string): Promise<void>
}

import { CupsPrintBackend } from "./cups"
import { PrintService } from "./service"
import type { PrintBackend } from "./types"

class UnsupportedPrintBackend implements PrintBackend {
  readonly name = "unsupported"
  private error(): never {
    throw new Error(
      `Direct printing is not supported on ${process.platform} yet. Generate the PDF and print it with your system viewer.`,
    )
  }
  async listPrinters(): Promise<never> {
    return this.error()
  }
  async getCapabilities(): Promise<never> {
    return this.error()
  }
  async submit(): Promise<never> {
    return this.error()
  }
  async listJobs(): Promise<never> {
    return this.error()
  }
  async cancelJob(): Promise<never> {
    return this.error()
  }
}

export function createSystemPrintBackend(platform: NodeJS.Platform = process.platform): PrintBackend {
  return platform === "darwin" || platform === "linux" ? new CupsPrintBackend() : new UnsupportedPrintBackend()
}

export function createPrintService(backend = createSystemPrintBackend()) {
  return new PrintService(backend)
}

export { CupsPrintBackend, parseCapabilities, parseJobs, parsePrinterList } from "./cups"
export { PrintService } from "./service"
export type {
  DuplexMode,
  PreparedPrintJob,
  PreparePrintJobInput,
  PrintBackend,
  PrintColorMode,
  Printer,
  PrinterCapabilities,
  PrintJob,
  PrintJobState,
  PrintOptions,
  SubmittedPrintJob,
} from "./types"

import { runChecked, runCommand } from "./runner"
import type {
  DuplexMode,
  PreparedPrintJob,
  PrintBackend,
  PrintColorMode,
  Printer,
  PrinterCapabilities,
  PrintJob,
  PrintOptions,
  SubmittedPrintJob,
} from "./types"

const PAGE_SIZE_OPTIONS: Record<NonNullable<PrintOptions["pageSize"]>, string> = {
  a4: "A4",
  letter: "Letter",
  legal: "Legal",
}

export function parsePrinterList(output: string): Printer[] {
  const defaultPrinter = output.match(/^system default destination:\s+(.+)$/m)?.[1]?.trim()
  const printers = new Map<string, Printer>()

  for (const line of output.split("\n")) {
    const match = line.match(/^printer\s+(\S+)\s+(.+)$/)
    if (!match) continue
    printers.set(match[1], {
      id: match[1],
      name: match[1],
      isDefault: match[1] === defaultPrinter,
      state: match[2].trim(),
    })
  }

  return [...printers.values()].sort((left, right) => {
    if (left.isDefault !== right.isDefault) return left.isDefault ? -1 : 1
    return left.name.localeCompare(right.name)
  })
}

export function parseCapabilities(output: string) {
  const rawOptions: Record<string, string[]> = {}
  for (const line of output.split("\n")) {
    const match = line.match(/^([^/:]+)(?:\/[^:]+)?:\s+(.+)$/)
    if (!match) continue
    rawOptions[match[1]] = match[2].split(/\s+/).map((value) => value.replace(/^\*/, ""))
  }
  return rawOptions
}

function findOption(rawOptions: Record<string, string[]>, names: string[]) {
  const entry = Object.entries(rawOptions).find(([name]) => names.includes(name.toLowerCase()))
  return entry?.[1] ?? []
}

function duplexModes(rawOptions: Record<string, string[]>): DuplexMode[] {
  const values = findOption(rawOptions, ["duplex", "sides"])
  const modes = new Set<DuplexMode>(["one-sided"])
  if (values.some((value) => /NoTumble|LongEdge/i.test(value))) modes.add("two-sided-long-edge")
  if (values.some((value) => /^(?:DuplexTumble|.*ShortEdge.*)$/i.test(value))) modes.add("two-sided-short-edge")
  return [...modes]
}

function colorModes(rawOptions: Record<string, string[]>): PrintColorMode[] {
  const values = findOption(rawOptions, ["colormodel", "print-color-mode", "colormode"])
  const modes = new Set<PrintColorMode>(["auto"])
  if (values.some((value) => /color|rgb|cmyk/i.test(value))) modes.add("color")
  if (values.some((value) => /gray|grey|mono|black/i.test(value))) modes.add("monochrome")
  return [...modes]
}

export function parseJobs(output: string): PrintJob[] {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/)
      const id = parts[0]
      const separator = id.lastIndexOf("-")
      return {
        id,
        printerId: separator > 0 ? id.slice(0, separator) : id,
        state: "pending" as const,
        owner: parts[1],
        sizeBytes: Number.isFinite(Number(parts[2])) ? Number(parts[2]) : undefined,
        submittedAt: parts.slice(3).join(" ") || undefined,
      }
    })
}

export class CupsPrintBackend implements PrintBackend {
  readonly name = "cups"

  async listPrinters() {
    const printerResult = await runCommand("lpstat", ["-p"])
    if (printerResult.exitCode !== 0) {
      if (/No destinations added/i.test(printerResult.stderr)) return []
      if (/Bad file descriptor|scheduler is not running/i.test(printerResult.stderr)) {
        throw new Error("The CUPS scheduler is not running or is not accessible.")
      }
      throw new Error(printerResult.stderr || "CUPS could not list printers.")
    }
    const defaultResult = await runCommand("lpstat", ["-d"])
    return parsePrinterList(`${printerResult.stdout}\n${defaultResult.stdout}`)
  }

  async getCapabilities(printerId: string): Promise<PrinterCapabilities> {
    const printer = (await this.listPrinters()).find((candidate) => candidate.id === printerId)
    if (!printer) throw new Error(`Printer ${printerId} is not available.`)
    const { stdout } = await runChecked("lpoptions", ["-p", printerId, "-l"])
    const rawOptions = parseCapabilities(stdout)
    return {
      printer,
      pageSizes: findOption(rawOptions, ["pagesize", "media"]),
      duplexModes: duplexModes(rawOptions),
      colorModes: colorModes(rawOptions),
      rawOptions,
    }
  }

  async submit(
    pdfBytes: Uint8Array,
    printer: Printer,
    options: PreparedPrintJob["options"],
  ): Promise<SubmittedPrintJob> {
    if (!/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(printer.id)) throw new Error("Invalid CUPS printer ID.")
    const args = ["-d", printer.id, "-n", String(options.copies), "-o", `media=${PAGE_SIZE_OPTIONS[options.pageSize]}`]
    args.push("-o", `sides=${options.duplex}`)
    if (options.color === "monochrome") args.push("-o", "print-color-mode=monochrome")
    if (options.color === "color") args.push("-o", "print-color-mode=color")
    if (options.pageRanges) args.push("-P", options.pageRanges)
    args.push("--", "-")

    const { stdout } = await runChecked("lp", args, 30_000, pdfBytes)
    const id = stdout.match(/request id is\s+(\S+)/i)?.[1]
    if (!id) throw new Error(`CUPS accepted the command but did not return a print job ID: ${stdout}`)
    return { id, printerId: printer.id, submittedAt: new Date().toISOString(), rawOutput: stdout }
  }

  async listJobs() {
    const result = await runCommand("lpstat", ["-W", "not-completed", "-o"])
    if (result.exitCode !== 0 && !/No entries/i.test(result.stderr)) {
      throw new Error(result.stderr || "CUPS could not list print jobs.")
    }
    return parseJobs(result.stdout)
  }

  async cancelJob(jobId: string) {
    if (!/^[A-Za-z0-9_][A-Za-z0-9_.-]*-[1-9]\d*$/.test(jobId)) throw new Error("Invalid CUPS print job ID.")
    await runChecked("cancel", [jobId])
  }
}

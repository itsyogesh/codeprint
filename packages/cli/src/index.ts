#!/usr/bin/env node
import { realpathSync } from "node:fs"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { basename, extname, join, resolve } from "node:path"
import { createInterface } from "node:readline/promises"
import { pathToFileURL } from "node:url"
import type { CreatePrintablePdfInput, PageOrientation, PageSize, PrintableFormat } from "@codeprint/core"
import { renderPrintablePdf } from "@codeprint/core/render"
import { importNodeSource } from "@codeprint/core/source/node"
import { createPrintService, type DuplexMode, type PrintColorMode } from "@codeprint/print"
import { Command, Option } from "commander"
import { inferInput, parseFormat, readInput, writePdf } from "./files"
import { choice, integer } from "./options"

interface OutputOptions {
  json?: boolean
}

interface DocumentOptions {
  url?: string
  format?: PrintableFormat
  language?: string
  filename?: string
  pageSize: PageSize
  orientation: PageOrientation
  fontSize?: number
  columns: number
  header: boolean
  toc?: boolean
  margins?: "small" | "normal" | "wide"
  theme?: "light" | "dark"
  lineNumbers: boolean
  colorized: boolean
  headerRow: boolean
  alternatingColors: boolean
}

interface RenderOptions extends DocumentOptions {
  output?: string
  force?: boolean
}

interface PrintCommandOptions extends DocumentOptions {
  printer?: string
  copies: number
  duplex: DuplexMode
  color: PrintColorMode
  pageRanges?: string
  yes?: boolean
}

function output(value: unknown, json: boolean | undefined, text: string) {
  process.stdout.write(json ? `${JSON.stringify(value, null, 2)}\n` : `${text}\n`)
}

function addDocumentOptions(command: Command) {
  return command
    .option("--url <https-url>", "import a public GitHub file or direct HTTPS text file (2 MiB limit)")
    .addOption(new Option("--format <format>", "input format").argParser((value) => parseFormat(value)))
    .option("--language <language>", "syntax language for code")
    .option("--filename <name>", "filename shown in the PDF header")
    .addOption(
      new Option("--page-size <size>", "paper size")
        .default("a4")
        .argParser(choice(["a4", "letter", "legal"] as const)),
    )
    .addOption(
      new Option("--orientation <orientation>", "paper orientation")
        .default("portrait")
        .argParser(choice(["portrait", "landscape"] as const)),
    )
    .option("--font-size <points>", "font size from 8 to 24", integer)
    .option("--columns <count>", "code columns from 1 to 3", integer, 1)
    .option("--no-header", "hide the running header")
    .option("--toc", "include a Markdown table of contents")
    .addOption(
      new Option("--margins <size>", "Markdown margins").argParser(choice(["small", "normal", "wide"] as const)),
    )
    .addOption(new Option("--theme <theme>", "Markdown code block theme").argParser(choice(["light", "dark"] as const)))
    .option("--no-line-numbers", "hide code line numbers")
    .option("--no-colorized", "disable code syntax colors")
    .option("--no-header-row", "treat the first CSV row as data")
    .option("--no-alternating-colors", "disable alternating CSV row shading")
}

async function documentInput(
  inputPath: string | undefined,
  options: DocumentOptions,
): Promise<CreatePrintablePdfInput> {
  if (options.url && inputPath) throw new Error("Choose either a local input file or --url, not both.")
  if (inputPath && /^https?:\/\//i.test(inputPath)) throw new Error("Use --url <https-url> to import a public file.")
  const remote = options.url ? await importNodeSource(options.url) : undefined
  const source = remote ?? (await readInput(inputPath))
  const inferred = remote
    ? { format: remote.format, language: remote.language }
    : inferInput(source.filename ?? options.filename)
  const format = options.format ?? inferred.format
  return {
    content: source.content,
    format,
    filename: options.filename ?? source.filename,
    language: options.language ?? (format === "code" ? inferred.language : undefined),
    pageSize: options.pageSize,
    orientation: options.orientation,
    fontSize: options.fontSize,
    columns: options.columns,
    showHeader: options.header,
    margins: options.margins,
    tableOfContents: options.toc,
    codeTheme: options.theme,
    lineNumbers: options.lineNumbers,
    colorized: options.colorized,
    hasHeaderRow: options.headerRow,
    alternatingColors: options.alternatingColors,
  }
}

async function confirm(summary: string) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Printing needs confirmation. Re-run in a terminal or pass --yes after reviewing the settings.")
  }
  const prompt = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = await prompt.question(`Print ${summary}? [y/N] `)
    return /^y(?:es)?$/i.test(answer.trim())
  } finally {
    prompt.close()
  }
}

export function createProgram() {
  const program = new Command()
    .name("codeprint")
    .description("Turn code, Markdown, and CSV into readable PDFs and local print jobs.")
    .version("0.2.0")
    .option("--json", "write machine-readable JSON")

  addDocumentOptions(program.command("render [input]").description("Render a source file or stdin to PDF."))
    .option("-o, --output <path>", "output PDF path or directory")
    .option("--force", "replace an existing output file")
    .action(async (inputPath: string | undefined, options: RenderOptions, command: Command) => {
      const rendered = await renderPrintablePdf(await documentInput(inputPath, options))
      const outputPath = await writePdf(rendered, options.output, options.force)
      const result = {
        path: outputPath,
        pages: rendered.pages,
        sizeBytes: rendered.bytes.byteLength,
        format: rendered.format,
      }
      output(
        result,
        command.optsWithGlobals<OutputOptions>().json,
        `Created ${rendered.pages}-page PDF at ${outputPath}`,
      )
    })

  addDocumentOptions(
    program.command("print [input]").description("Prepare and submit a local print job after confirmation."),
  )
    .option("--printer <id>", "printer ID; defaults to the system printer")
    .option("--copies <count>", "number of copies", integer, 1)
    .addOption(
      new Option("--duplex <mode>", "duplex mode")
        .default("one-sided")
        .argParser(choice(["one-sided", "two-sided-long-edge", "two-sided-short-edge"] as const)),
    )
    .addOption(
      new Option("--color <mode>", "color mode")
        .default("auto")
        .argParser(choice(["auto", "color", "monochrome"] as const)),
    )
    .option("--page-ranges <ranges>", "pages such as 1-3,5")
    .option("-y, --yes", "submit without an interactive prompt")
    .action(async (inputPath: string | undefined, options: PrintCommandOptions, command: Command) => {
      if (options.url && inputPath) throw new Error("Choose either a local input file or --url, not both.")
      let pdfPath: string
      let temporaryDirectory: string | undefined
      const isPdf = Boolean(inputPath && inputPath !== "-" && extname(inputPath).toLowerCase() === ".pdf")
      if (isPdf) {
        pdfPath = resolve(inputPath as string)
      } else {
        const rendered = await renderPrintablePdf(await documentInput(inputPath, options))
        temporaryDirectory = await mkdtemp(join(tmpdir(), "codeprint-cli-"))
        pdfPath = await writePdf(rendered, temporaryDirectory)
      }

      const service = createPrintService()
      try {
        const prepared = await service.prepare({
          pdfPath,
          options: {
            printerId: options.printer,
            copies: options.copies,
            pageSize: options.pageSize,
            duplex: options.duplex,
            color: options.color,
            pageRanges: options.pageRanges,
          },
        })
        const json = command.optsWithGlobals<OutputOptions>().json
        process.stderr.write(`Prepared ${basename(pdfPath)}: ${prepared.summary}\n`)
        if (!options.yes && !(await confirm(prepared.summary))) {
          output({ prepared, cancelled: true }, json, "Print job cancelled before submission.")
          return
        }
        const submitted = await service.submit(prepared.confirmationToken)
        output({ prepared, submitted }, json, `Submitted print job ${submitted.id}.`)
      } finally {
        service.dispose()
        if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true })
      }
    })

  program
    .command("printers")
    .description("List configured local printers.")
    .action(async (_options, command: Command) => {
      const printers = await createPrintService().listPrinters()
      const text = printers.length
        ? printers.map((printer) => `${printer.isDefault ? "*" : " "} ${printer.id}\t${printer.state}`).join("\n")
        : "No printers are configured."
      output({ printers }, command.optsWithGlobals<OutputOptions>().json, text)
    })

  program
    .command("printer-info <printer>")
    .description("Show paper, duplex, and color capabilities for a printer.")
    .action(async (printer: string, _options, command: Command) => {
      const capabilities = await createPrintService().getCapabilities(printer)
      output(capabilities, command.optsWithGlobals<OutputOptions>().json, JSON.stringify(capabilities, null, 2))
    })

  program
    .command("jobs")
    .description("List incomplete local print jobs.")
    .action(async (_options, command: Command) => {
      const jobs = await createPrintService().listJobs()
      const text = jobs.length ? jobs.map((job) => `${job.id}\t${job.state}`).join("\n") : "No incomplete print jobs."
      output({ jobs }, command.optsWithGlobals<OutputOptions>().json, text)
    })

  program
    .command("cancel <job-id>")
    .description("Cancel an incomplete local print job.")
    .action(async (jobId: string, _options, command: Command) => {
      await createPrintService().cancelJob(jobId)
      output({ cancelled: jobId }, command.optsWithGlobals<OutputOptions>().json, `Cancelled print job ${jobId}.`)
    })

  return program
}

export async function main(argv = process.argv) {
  const program = createProgram()
  await program.parseAsync(argv)
}

function isEntrypoint() {
  if (!process.argv[1]) return false
  try {
    return pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url
  } catch {
    return false
  }
}

if (isEntrypoint()) {
  main().catch((error) => {
    process.stderr.write(`Codeprint: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}

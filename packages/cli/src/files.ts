import { type FileHandle, mkdir, open, readFile, stat } from "node:fs/promises"
import { basename, dirname, extname, resolve } from "node:path"
import type { CreatePrintablePdfInput, PrintableFormat, RenderedPdf } from "@codeprint/core"

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  c: "c",
  cc: "cpp",
  cpp: "cpp",
  cs: "csharp",
  css: "css",
  dart: "dart",
  go: "go",
  html: "html",
  java: "java",
  js: "javascript",
  json: "json",
  jsx: "javascript",
  kt: "kotlin",
  php: "php",
  py: "python",
  r: "r",
  rb: "ruby",
  rs: "rust",
  scala: "scala",
  sh: "shell",
  sql: "sql",
  swift: "swift",
  ts: "typescript",
  tsx: "typescript",
  xml: "xml",
}

export function inferInput(filename: string | undefined): Pick<CreatePrintablePdfInput, "format" | "language"> {
  const extension = extname(filename ?? "")
    .slice(1)
    .toLowerCase()
  if (extension === "md" || extension === "markdown" || extension === "mdx") return { format: "markdown" }
  if (extension === "csv") return { format: "csv" }
  return { format: "code", language: LANGUAGE_BY_EXTENSION[extension] ?? "plaintext" }
}

export async function readInput(inputPath: string | undefined) {
  if (!inputPath || inputPath === "-") {
    const chunks: Buffer[] = []
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk))
    return { content: Buffer.concat(chunks).toString("utf8"), filename: undefined }
  }
  const absolutePath = resolve(inputPath)
  return { content: await readFile(absolutePath, "utf8"), filename: basename(absolutePath) }
}

async function pathKind(path: string) {
  try {
    const details = await stat(path)
    return details.isDirectory() ? "directory" : "file"
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "missing"
    throw error
  }
}

export async function writePdf(rendered: RenderedPdf, output: string | undefined, force = false) {
  const requested = resolve(output ?? rendered.suggestedFilename)
  const kind = await pathKind(requested)
  const outputPath =
    kind === "directory" || (kind === "missing" && extname(requested).toLowerCase() !== ".pdf")
      ? resolve(requested, rendered.suggestedFilename)
      : requested
  await mkdir(dirname(outputPath), { recursive: true })
  let handle: FileHandle
  try {
    handle = await open(outputPath, force ? "w" : "wx")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error(`Output already exists at ${outputPath}. Use --force to replace it.`)
    }
    throw error
  }
  try {
    await handle.writeFile(rendered.bytes)
  } finally {
    await handle.close()
  }
  return outputPath
}

export function parseFormat(value: string): PrintableFormat {
  if (value === "markdown" || value === "code" || value === "csv") return value
  throw new Error("Format must be markdown, code, or csv.")
}

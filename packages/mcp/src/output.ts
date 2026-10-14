import { mkdir, open } from "node:fs/promises"
import { homedir } from "node:os"
import { extname, join } from "node:path"
import { pathToFileURL } from "node:url"
import type { RenderedPdf } from "@codeprint/core"

export interface PrintablePdfResult extends Record<string, unknown> {
  path: string
  uri: string
  format: RenderedPdf["format"]
  pages: number
  sizeBytes: number
}

export function getOutputDirectory() {
  return process.env.CODEPRINT_OUTPUT_DIR || join(homedir(), "Downloads", "Codeprint")
}

async function writeWithoutOverwrite(directory: string, filename: string, bytes: Uint8Array) {
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const extension = extname(filename)
  const stem = filename.slice(0, -extension.length)

  for (let copy = 1; copy <= 10_000; copy += 1) {
    const candidate = copy === 1 ? filename : `${stem}-${copy}${extension}`
    const outputPath = join(directory, candidate)
    try {
      const handle = await open(outputPath, "wx", 0o600)
      try {
        await handle.writeFile(bytes)
      } finally {
        await handle.close()
      }
      return outputPath
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error
    }
  }
  throw new Error("Could not create a unique PDF filename.")
}

export async function writeRenderedPdf(rendered: RenderedPdf, outputDirectory = getOutputDirectory()) {
  const path = await writeWithoutOverwrite(outputDirectory, rendered.suggestedFilename, rendered.bytes)
  return {
    path,
    uri: pathToFileURL(path).href,
    format: rendered.format,
    pages: rendered.pages,
    sizeBytes: rendered.bytes.byteLength,
  } satisfies PrintablePdfResult
}

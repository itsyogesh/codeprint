import { chmod, mkdtemp, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { inferInput, writePdf } from "../src/files"

describe("CLI input inference", () => {
  it("routes Markdown and CSV to their document renderers", () => {
    expect(inferInput("README.md")).toEqual({ format: "markdown" })
    expect(inferInput("report.csv")).toEqual({ format: "csv" })
  })

  it("treats JSON as syntax-highlighted code", () => {
    expect(inferInput("payload.json")).toEqual({ format: "code", language: "json" })
    expect(inferInput("index.ts")).toEqual({ format: "code", language: "typescript" })
  })
})

describe("CLI PDF file permissions", () => {
  it.skipIf(process.platform === "win32")(
    "creates private PDFs without changing existing directory permissions",
    async () => {
      const directory = await mkdtemp(join(tmpdir(), "codeprint-cli-permissions-"))
      await chmod(directory, 0o750)
      const rendered = {
        bytes: new Uint8Array(Buffer.from("%PDF-1.7\nSynthetic test")),
        format: "markdown" as const,
        pages: 1,
        sourceFilename: "synthetic.md",
        suggestedFilename: "synthetic.pdf",
      }
      const output = await writePdf(rendered, directory)
      expect((await stat(output)).mode & 0o777).toBe(0o600)
      expect((await stat(directory)).mode & 0o777).toBe(0o750)
      const nested = join(directory, "new-private-directory")
      await writePdf(rendered, nested)
      expect((await stat(nested)).mode & 0o777).toBe(0o700)
    },
  )
})

import { chmod, mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { DocumentStore } from "../src/documents"
import { writeRenderedPdf } from "../src/output"

const directories: string[] = []
const document = () => ({
  bytes: new Uint8Array(Buffer.from("%PDF-1.7\nprivate document\n")),
  format: "markdown" as const,
  pages: 1,
  sourceFilename: "private.md",
  suggestedFilename: "private.pdf",
})

async function directory() {
  const path = await mkdtemp(join(tmpdir(), "codeprint-output-test-"))
  directories.push(path)
  return path
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })))
})

describe("private PDF output", () => {
  it.skipIf(process.platform === "win32")("creates private new directories and PDFs", async () => {
    const output = join(await directory(), "new", "output")
    const rendered = document()
    const saved = await writeRenderedPdf(rendered, output)
    expect((await stat(output)).mode & 0o777).toBe(0o700)
    expect((await stat(join(output, ".."))).mode & 0o777).toBe(0o700)
    expect((await stat(saved.path)).mode & 0o777).toBe(0o600)
    expect(await readFile(saved.path)).toEqual(Buffer.from(rendered.bytes))
  })

  it.skipIf(process.platform === "win32")("does not chmod an existing user directory", async () => {
    const output = join(await directory(), "shared-output")
    await mkdir(output)
    await chmod(output, 0o750)
    const saved = await writeRenderedPdf(document(), output)
    expect((await stat(output)).mode & 0o777).toBe(0o750)
    expect((await stat(saved.path)).mode & 0o777).toBe(0o600)
  })

  it("does not overwrite existing PDFs and retains saved files after preview disposal", async () => {
    const output = await directory()
    const rendered = document()
    const first = await writeRenderedPdf(rendered, output)
    const second = await writeRenderedPdf(
      { ...rendered, bytes: new Uint8Array(Buffer.from("%PDF-1.7\nsecond\n")) },
      output,
    )
    expect(first.path).not.toBe(second.path)
    const store = new DocumentStore()
    store.add(rendered)
    store.dispose()
    expect(await readFile(first.path)).toEqual(Buffer.from(rendered.bytes))
    expect(await readFile(second.path)).toEqual(Buffer.from("%PDF-1.7\nsecond\n"))
  })
})

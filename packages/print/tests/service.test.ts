import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it, vi } from "vitest"
import { type PrintBackend, type Printer, type PrinterCapabilities, PrintService } from "../src"

const printer: Printer = { id: "Office", name: "Office", isDefault: true, state: "idle" }

function backend(): PrintBackend {
  return {
    name: "fake",
    listPrinters: vi.fn(async () => [printer]),
    getCapabilities: vi.fn(
      async (): Promise<PrinterCapabilities> => ({
        printer,
        pageSizes: ["A4"],
        duplexModes: ["one-sided"],
        colorModes: ["auto"],
        rawOptions: {},
      }),
    ),
    submit: vi.fn(async (_path, selected) => ({
      id: "Office-1",
      printerId: selected.id,
      submittedAt: new Date(0).toISOString(),
    })),
    listJobs: vi.fn(async () => []),
    cancelJob: vi.fn(async () => undefined),
  }
}

describe("PrintService", () => {
  it("requires a prepared, single-use confirmation token", async () => {
    const directory = await mkdtemp(join(tmpdir(), "codeprint-print-test-"))
    const pdfPath = join(directory, "document.pdf")
    await writeFile(pdfPath, "%PDF-1.7\n")
    const fake = backend()
    const service = new PrintService(fake)

    const prepared = await service.prepare({ pdfPath, options: { copies: 2 } })
    expect(prepared.summary).toContain("2 copies")
    expect(fake.submit).not.toHaveBeenCalled()

    await expect(service.submit(prepared.confirmationToken)).resolves.toMatchObject({ id: "Office-1" })
    await expect(service.submit(prepared.confirmationToken)).rejects.toThrow("invalid or has expired")
    expect(fake.submit).toHaveBeenCalledTimes(1)
  })

  it("rejects a non-PDF before printer submission", async () => {
    const directory = await mkdtemp(join(tmpdir(), "codeprint-print-test-"))
    const textPath = join(directory, "document.txt")
    await writeFile(textPath, "not a PDF")
    const service = new PrintService(backend())
    await expect(service.prepare({ pdfPath: textPath })).rejects.toThrow("is not a PDF")
  })
})

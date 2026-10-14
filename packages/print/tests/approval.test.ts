import { createHash } from "node:crypto"
import { mkdtemp, rename, rm, symlink, truncate, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { type PrintBackend, type Printer, type PrinterCapabilities, PrintService } from "../src"

const originalPdf = "%PDF-1.7\noriginal document\n"
const directories: string[] = []
const services: PrintService[] = []

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "codeprint-approval-test-"))
  directories.push(directory)
  const pdfPath = join(directory, "document.pdf")
  await writeFile(pdfPath, originalPdf)
  const printer: Printer = { id: "Office", name: "Office", isDefault: true, state: "idle" }
  const backend: PrintBackend = {
    name: "fake",
    listPrinters: vi.fn(async () => [{ ...printer }]),
    getCapabilities: vi.fn(
      async (): Promise<PrinterCapabilities> => ({
        printer,
        pageSizes: ["A4"],
        duplexModes: ["one-sided"],
        colorModes: ["auto"],
        rawOptions: {},
      }),
    ),
    submit: vi.fn(async (_bytes, selected) => ({
      id: "Office-1",
      printerId: selected.id,
      submittedAt: new Date(0).toISOString(),
    })),
    listJobs: vi.fn(async () => []),
    cancelJob: vi.fn(async () => undefined),
  }
  const service = new PrintService(backend)
  services.push(service)
  return { directory, pdfPath, backend, service }
}

afterEach(async () => {
  for (const service of services.splice(0)) service.dispose()
  vi.useRealTimers()
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe("PrintService approval boundary", () => {
  it("binds the digest and exact settings, then wipes the consumed buffer", async () => {
    const { pdfPath, backend, service } = await fixture()
    let consumed: Uint8Array | undefined
    vi.mocked(backend.submit).mockImplementation(async (bytes, selected, options) => {
      consumed = bytes
      expect(Buffer.from(bytes).toString()).toBe(originalPdf)
      expect(selected.id).toBe("Office")
      expect(options.copies).toBe(2)
      return { id: "Office-1", printerId: selected.id, submittedAt: new Date(0).toISOString() }
    })
    const prepared = await service.prepare({ pdfPath, options: { copies: 2 } })
    expect(prepared.contentSha256).toBe(createHash("sha256").update(originalPdf).digest("hex"))
    await service.submit(prepared.confirmationToken)
    expect(consumed?.every((byte) => byte === 0)).toBe(true)
    await expect(service.submit(prepared.confirmationToken)).rejects.toThrow("invalid or has expired")
  })

  it("does not trust a mutable returned receipt or input options", async () => {
    const { pdfPath, service, backend } = await fixture()
    const options = { copies: 2, printerId: "Office" }
    const preparing = service.prepare({ pdfPath, options })
    options.copies = 99
    options.printerId = "Other"
    const receipt = await preparing
    const token = receipt.confirmationToken
    receipt.options.copies = 99
    receipt.options.pageSize = "legal"
    receipt.printer.id = "Other"
    receipt.pdfPath = "/unapproved.pdf"
    receipt.contentSha256 = "tampered"
    receipt.expiresAt = new Date(0).toISOString()
    await service.submit(token)
    expect(backend.submit).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      expect.objectContaining({ id: "Office" }),
      expect.objectContaining({ copies: 2, pageSize: "a4" }),
    )
  })

  it("rejects changed PDFs even when their byte length is unchanged", async () => {
    const { pdfPath, service, backend } = await fixture()
    const receipt = await service.prepare({ pdfPath })
    await writeFile(pdfPath, originalPdf.replace("original", "tampered"))
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("PDF changed")
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("invalid or has expired")
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("rejects inode replacement even if the content is identical", async () => {
    const { directory, pdfPath, service, backend } = await fixture()
    const receipt = await service.prepare({ pdfPath })
    const replacement = join(directory, "replacement.pdf")
    await writeFile(replacement, originalPdf)
    await rename(replacement, pdfPath)
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("PDF changed")
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("rejects deletion of the reviewed source", async () => {
    const { pdfPath, service, backend } = await fixture()
    const receipt = await service.prepare({ pdfPath })
    await rm(pdfPath)
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow()
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("rejects symlinks both before preparation and after approval", async () => {
    const { directory, pdfPath, service, backend } = await fixture()
    const link = join(directory, "link.pdf")
    await symlink(pdfPath, link)
    await expect(service.prepare({ pdfPath: link })).rejects.toThrow()
    const receipt = await service.prepare({ pdfPath })
    await rm(link)
    await writeFile(link, originalPdf)
    await rm(pdfPath)
    await symlink(link, pdfPath)
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow()
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("passes snapshot bytes rather than a mutable path across the final backend race", async () => {
    const { pdfPath, service, backend } = await fixture()
    vi.mocked(backend.submit).mockImplementation(async (bytes, selected) => {
      await writeFile(pdfPath, "%PDF-1.7\nchanged after final verification\n")
      expect(Buffer.from(bytes).toString()).toBe(originalPdf)
      return { id: "Office-1", printerId: selected.id, submittedAt: new Date(0).toISOString() }
    })
    const receipt = await service.prepare({ pdfPath })
    await service.submit(receipt.confirmationToken)
  })

  it("allows only one concurrent submission", async () => {
    const { pdfPath, service, backend } = await fixture()
    const receipt = await service.prepare({ pdfPath })
    const attempts = await Promise.allSettled([
      service.submit(receipt.confirmationToken),
      service.submit(receipt.confirmationToken),
    ])
    expect(attempts.filter((attempt) => attempt.status === "fulfilled")).toHaveLength(1)
    expect(backend.submit).toHaveBeenCalledTimes(1)
  })

  it("counts in-flight submissions against preparation capacity until the backend completes", async () => {
    const { pdfPath, service, backend } = await fixture()
    let finish: (() => void) | undefined
    let markStarted: (() => void) | undefined
    const started = new Promise<void>((resolve) => {
      markStarted = resolve
    })
    vi.mocked(backend.submit).mockImplementation(async () => {
      markStarted?.()
      await new Promise<void>((resolve) => {
        finish = resolve
      })
      return { id: "Office-1", printerId: "Office", submittedAt: new Date(0).toISOString() }
    })
    const receipts = await Promise.all(Array.from({ length: 8 }, () => service.prepare({ pdfPath })))
    const submitted = service.submit(receipts[0].confirmationToken)
    await started
    await expect(service.prepare({ pdfPath })).rejects.toThrow("Too many pending")
    finish?.()
    await submitted
    await expect(service.prepare({ pdfPath })).resolves.toHaveProperty("confirmationToken")
  })

  it("expires idle preparations automatically and releases count capacity", async () => {
    vi.useFakeTimers()
    const { pdfPath, service, backend } = await fixture()
    const receipts = await Promise.all(Array.from({ length: 8 }, () => service.prepare({ pdfPath })))
    await expect(service.prepare({ pdfPath })).rejects.toThrow("Too many pending")
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
    for (const receipt of receipts)
      await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("invalid or has expired")
    await expect(service.prepare({ pdfPath })).resolves.toHaveProperty("confirmationToken")
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("uses internal expiry even if the caller extends the returned receipt", async () => {
    const { pdfPath, service, backend } = await fixture()
    const receipt = await service.prepare({ pdfPath })
    receipt.expiresAt = "2999-01-01T00:00:00.000Z"
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 6 * 60 * 1000)
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("invalid or has expired")
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("consumes the token and wipes memory even when backend submission fails", async () => {
    const { pdfPath, service, backend } = await fixture()
    let consumed: Uint8Array | undefined
    vi.mocked(backend.submit).mockImplementation(async (bytes) => {
      consumed = bytes
      throw new Error("printer offline")
    })
    const receipt = await service.prepare({ pdfPath })
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("printer offline")
    expect(consumed?.every((byte) => byte === 0)).toBe(true)
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("invalid or has expired")
  })

  it("discards cancelled jobs and disposes all pending jobs", async () => {
    const { pdfPath, service, backend } = await fixture()
    const discarded = await service.prepare({ pdfPath })
    service.discard(discarded.confirmationToken)
    service.discard(discarded.confirmationToken)
    await expect(service.submit(discarded.confirmationToken)).rejects.toThrow("invalid or has expired")
    const pending = await service.prepare({ pdfPath })
    service.dispose()
    await expect(service.submit(pending.confirmationToken)).rejects.toThrow("invalid or has expired")
    await expect(service.prepare({ pdfPath })).rejects.toThrow("disposed")
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("rejects oversized files before allocation and non-regular inputs", async () => {
    const { directory, pdfPath, service, backend } = await fixture()
    await truncate(pdfPath, 32 * 1024 * 1024 + 1)
    await expect(service.prepare({ pdfPath })).rejects.toThrow("32 MiB")
    await expect(service.prepare({ pdfPath: directory })).rejects.toThrow("regular file")
    expect(backend.listPrinters).not.toHaveBeenCalled()
  })

  it("bounds total snapshot bytes and releases the reservation on discard", async () => {
    const { pdfPath, service } = await fixture()
    await truncate(pdfPath, 32 * 1024 * 1024)
    const first = await service.prepare({ pdfPath })
    await service.prepare({ pdfPath })
    await expect(service.prepare({ pdfPath })).rejects.toThrow("64 MiB")
    service.discard(first.confirmationToken)
    await expect(service.prepare({ pdfPath })).resolves.toHaveProperty("confirmationToken")
  })

  it("releases memory reservations when preparation fails", async () => {
    const { pdfPath, backend, service } = await fixture()
    await truncate(pdfPath, 32 * 1024 * 1024)
    vi.mocked(backend.getCapabilities).mockRejectedValueOnce(new Error("unavailable"))
    await expect(service.prepare({ pdfPath })).rejects.toThrow("unavailable")
    await service.prepare({ pdfPath })
    await expect(service.prepare({ pdfPath })).resolves.toHaveProperty("confirmationToken")
  })

  it.each([
    { copies: 0 },
    { copies: 100 },
    { copies: 1.5 },
    { pageSize: "invalid" },
    { duplex: "invalid" },
    { color: "invalid" },
    { pageRanges: "0-1" },
    { pageRanges: "3-1" },
    { pageRanges: "--help" },
  ])("rejects invalid runtime options %j", async (options) => {
    const { pdfPath, service, backend } = await fixture()
    await expect(service.prepare({ pdfPath, options: options as never })).rejects.toThrow()
    expect(backend.submit).not.toHaveBeenCalled()
  })
})

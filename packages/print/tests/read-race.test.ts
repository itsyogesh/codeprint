import { execFile } from "node:child_process"
import { mkdtemp, rm, truncate, utimes, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"
import { afterEach, describe, expect, it, vi } from "vitest"
import { type PrintBackend, type PrinterCapabilities, PrintService } from "../src"

const hooks = vi.hoisted(() => ({ afterRead: undefined as ((bytes: Buffer) => Promise<void>) | undefined }))

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>()
  return {
    ...actual,
    open: async (...args: Parameters<typeof actual.open>) => {
      const handle = await actual.open(...args)
      const read = handle.read.bind(handle)
      handle.read = (async (...readArgs: unknown[]) => {
        const result = await Reflect.apply(read, handle, readArgs)
        const hook = hooks.afterRead
        if (hook) {
          hooks.afterRead = undefined
          await hook(readArgs[0] as Buffer)
        }
        return result
      }) as typeof handle.read
      return handle
    },
  }
})

const directories: string[] = []
const services: PrintService[] = []
async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "codeprint-read-race-"))
  directories.push(directory)
  const pdfPath = join(directory, "document.pdf")
  await writeFile(pdfPath, "%PDF-1.7\noriginal\n")
  const printer = { id: "Office", name: "Office", state: "idle", isDefault: true }
  const backend: PrintBackend = {
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
    submit: vi.fn(async () => ({ id: "Office-1", printerId: "Office", submittedAt: new Date().toISOString() })),
    listJobs: vi.fn(async () => []),
    cancelJob: vi.fn(async () => undefined),
  }
  const service = new PrintService(backend)
  services.push(service)
  return { pdfPath, directory, backend, service }
}

afterEach(async () => {
  hooks.afterRead = undefined
  for (const service of services.splice(0)) service.dispose()
  vi.useRealTimers()
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe("PDF snapshot races", () => {
  it("verifies large PDFs with a bounded streaming buffer, not a second snapshot", async () => {
    const { pdfPath, service } = await fixture()
    await truncate(pdfPath, 2 * 1024 * 1024)
    const receipt = await service.prepare({ pdfPath })
    let captured: Buffer | undefined
    hooks.afterRead = async (bytes) => {
      captured = bytes
    }
    await service.submit(receipt.confirmationToken)
    expect(captured?.byteLength).toBe(64 * 1024)
    expect(captured?.every((byte) => byte === 0)).toBe(true)
  })
  it("rejects concurrent writes during preparation and wipes the rejected buffer", async () => {
    const { pdfPath, service, backend } = await fixture()
    let captured: Buffer | undefined
    hooks.afterRead = async (bytes) => {
      captured = bytes
      await writeFile(pdfPath, "%PDF-1.7\nmodified\n")
      await utimes(pdfPath, new Date(0), new Date(0))
    }
    await expect(service.prepare({ pdfPath })).rejects.toThrow("changed while being read")
    expect(captured?.every((byte) => byte === 0)).toBe(true)
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("rejects concurrent writes during submission verification", async () => {
    const { pdfPath, service, backend } = await fixture()
    const receipt = await service.prepare({ pdfPath })
    hooks.afterRead = async () => {
      await writeFile(pdfPath, "%PDF-1.7\nmodified\n")
      await utimes(pdfPath, new Date(0), new Date(0))
    }
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("changed while being read")
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("rechecks expiry after asynchronous verification", async () => {
    const { pdfPath, service, backend } = await fixture()
    const receipt = await service.prepare({ pdfPath })
    hooks.afterRead = async () => {
      vi.useFakeTimers()
      vi.setSystemTime(Date.now() + 6 * 60 * 1000)
    }
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("has expired")
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("clears idle snapshots on expiry, without needing another service call", async () => {
    const { pdfPath, service } = await fixture()
    vi.useFakeTimers()
    let captured: Buffer | undefined
    hooks.afterRead = async (bytes) => {
      captured = bytes
    }
    await service.prepare({ pdfPath })
    expect(captured?.subarray(0, 5).toString()).toBe("%PDF-")
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
    expect(captured?.every((byte) => byte === 0)).toBe(true)
  })

  it("disposal aborts verification before the backend is invoked", async () => {
    const { pdfPath, service, backend } = await fixture()
    const receipt = await service.prepare({ pdfPath })
    hooks.afterRead = async () => service.dispose()
    await expect(service.submit(receipt.confirmationToken)).rejects.toThrow("disposed")
    expect(backend.submit).not.toHaveBeenCalled()
  })

  it("disposal wipes snapshots while printer discovery is still pending", async () => {
    const { pdfPath, service, backend } = await fixture()
    let captured: Buffer | undefined
    let finishDiscovery: (() => void) | undefined
    let markDiscoveryStarted: (() => void) | undefined
    const startedDiscovery = new Promise<void>((resolve) => {
      markDiscoveryStarted = resolve
    })
    hooks.afterRead = async (bytes) => {
      captured = bytes
    }
    vi.mocked(backend.listPrinters).mockImplementationOnce(async () => {
      markDiscoveryStarted?.()
      await new Promise<void>((resolve) => {
        finishDiscovery = resolve
      })
      return [{ id: "Office", name: "Office", state: "idle", isDefault: true }]
    })
    const preparation = service.prepare({ pdfPath })
    await startedDiscovery
    service.dispose()
    expect(captured?.every((byte) => byte === 0)).toBe(true)
    finishDiscovery?.()
    await expect(preparation).rejects.toThrow("disposed")
  })

  it("rejects FIFOs without blocking or contacting the print backend", async () => {
    const { directory, service, backend } = await fixture()
    const fifoPath = join(directory, "pipe.pdf")
    await promisify(execFile)("mkfifo", [fifoPath])
    await expect(service.prepare({ pdfPath: fifoPath })).rejects.toThrow("regular file")
    expect(backend.submit).not.toHaveBeenCalled()
  })
})

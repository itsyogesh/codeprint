import { createHash } from "node:crypto"
import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { type PrintBackend, PrintService } from "@codeprint/print"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { describe, expect, it, vi } from "vitest"
import { createCodeprintServer } from "../src/server"

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "codeprint-approval-protocol-"))
  const pdfPath = join(directory, "approved.pdf")
  const bytes = Buffer.from("%PDF-1.7\nApproved synthetic document.")
  await writeFile(pdfPath, bytes)
  const printer = { id: "Office", name: "Office", isDefault: true, state: "idle" }
  const received: Buffer[] = []
  const backend: PrintBackend = {
    name: "synthetic",
    listPrinters: async () => [printer],
    getCapabilities: async () => ({
      printer,
      pageSizes: ["A4"],
      duplexModes: ["one-sided"],
      colorModes: ["auto"],
      rawOptions: {},
    }),
    submit: vi.fn(async (pdfBytes, selected) => {
      received.push(Buffer.from(pdfBytes))
      return { id: "Office-1", printerId: selected.id, submittedAt: new Date().toISOString() }
    }),
    listJobs: async () => [],
    cancelJob: async () => {},
  }
  const service = new PrintService(backend)
  const dispose = vi.spyOn(service, "dispose")
  const server = createCodeprintServer({ outputDirectory: directory, printService: service })
  const client = new Client({ name: "approval protocol test", version: "1" })
  const [a, b] = InMemoryTransport.createLinkedPair()
  await Promise.all([server.connect(a), client.connect(b)])
  return { client, server, service, dispose, backend, pdfPath, bytes, received }
}

describe("MCP physical-print approval boundary", () => {
  it("exposes document identity, performs no print during prepare, and submits exact approved bytes once", async () => {
    const f = await fixture()
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const prepared = await f.client.callTool({ name: "prepare_print_job", arguments: { pdfPath: f.pdfPath } })
      expect(prepared.isError).not.toBe(true)
      const receipt = prepared.structuredContent as { confirmationToken: string; contentSha256: string }
      expect(receipt.contentSha256).toBe(createHash("sha256").update(f.bytes).digest("hex"))
      expect(f.backend.submit).not.toHaveBeenCalled()
      const submitted = await f.client.callTool({
        name: "submit_print_job",
        arguments: { confirmationToken: receipt.confirmationToken },
      })
      expect(submitted.isError).not.toBe(true)
      expect(f.received).toEqual([f.bytes])
      expect(
        (
          await f.client.callTool({
            name: "submit_print_job",
            arguments: { confirmationToken: receipt.confirmationToken },
          })
        ).isError,
      ).toBe(true)
      expect(f.backend.submit).toHaveBeenCalledTimes(1)
    } finally {
      await f.client.close()
      await f.server.close()
      errorLog.mockRestore()
    }
    expect(f.dispose).toHaveBeenCalled()
  })

  it("returns an error without printing if an approved path changes", async () => {
    const f = await fixture()
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const prepared = await f.client.callTool({ name: "prepare_print_job", arguments: { pdfPath: f.pdfPath } })
      const receipt = prepared.structuredContent as { confirmationToken: string }
      await writeFile(f.pdfPath, "%PDF-1.7\nUnapproved synthetic document.")
      const result = await f.client.callTool({
        name: "submit_print_job",
        arguments: { confirmationToken: receipt.confirmationToken },
      })
      expect(result.isError).toBe(true)
      expect(f.backend.submit).not.toHaveBeenCalled()
    } finally {
      await f.client.close()
      await f.server.close()
      errorLog.mockRestore()
    }
  })

  it("discards a pending approval when the client disconnects", async () => {
    const f = await fixture()
    const prepared = await f.client.callTool({ name: "prepare_print_job", arguments: { pdfPath: f.pdfPath } })
    const receipt = prepared.structuredContent as { confirmationToken: string }
    await f.client.close()
    await f.server.close()
    expect(f.dispose).toHaveBeenCalled()
    await expect(f.service.submit(receipt.confirmationToken)).rejects.toThrow("invalid or has expired")
    expect(f.backend.submit).not.toHaveBeenCalled()
  })
})

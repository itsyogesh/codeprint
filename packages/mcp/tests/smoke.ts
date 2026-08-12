import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { type PrintBackend, type Printer, PrintService } from "@codeprint/print"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { createCodeprintServer } from "../src"

const printer: Printer = { id: "Test_Printer", name: "Test Printer", isDefault: true, state: "idle" }
const backend: PrintBackend = {
  name: "test",
  listPrinters: async () => [printer],
  getCapabilities: async () => ({
    printer,
    pageSizes: ["A4"],
    duplexModes: ["one-sided", "two-sided-long-edge"],
    colorModes: ["auto", "monochrome"],
    rawOptions: {},
  }),
  submit: async (_path, selected) => ({
    id: "Test_Printer-1",
    printerId: selected.id,
    submittedAt: new Date().toISOString(),
  }),
  listJobs: async () => [],
  cancelJob: async () => undefined,
}

async function main() {
  const outputDirectory = await mkdtemp(join(tmpdir(), "codeprint-mcp-"))
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const server = createCodeprintServer({ outputDirectory, printService: new PrintService(backend) })
  const client = new Client({ name: "codeprint-smoke-test", version: "0.1.0" })

  try {
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
    const tools = await client.listTools()
    for (const name of ["create_printable_pdf", "list_printers", "prepare_print_job", "submit_print_job"]) {
      if (!tools.tools.some((tool) => tool.name === name)) throw new Error(`${name} was not registered.`)
    }

    const rendered = await client.callTool({
      name: "create_printable_pdf",
      arguments: {
        content: "# Codeprint MCP\n\nA local printable document.",
        format: "markdown",
        filename: "smoke.md",
      },
    })
    if (rendered.isError || !rendered.structuredContent) throw new Error("PDF rendering failed.")
    const pdfPath = (rendered.structuredContent as { path?: string }).path
    if (!pdfPath) throw new Error("PDF path was missing.")

    const prepared = await client.callTool({ name: "prepare_print_job", arguments: { pdfPath, copies: 1 } })
    if (prepared.isError || !prepared.structuredContent) throw new Error("Print preparation failed.")
    const token = (prepared.structuredContent as { confirmationToken?: string }).confirmationToken
    if (!token) throw new Error("Confirmation token was missing.")

    const submitted = await client.callTool({ name: "submit_print_job", arguments: { confirmationToken: token } })
    if (submitted.isError || (submitted.structuredContent as { id?: string })?.id !== "Test_Printer-1") {
      throw new Error("Print submission failed.")
    }
    process.stderr.write(`Codeprint MCP smoke test passed. Output: ${pdfPath}\n`)
  } finally {
    await client.close()
    await server.close()
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})

import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { describe, expect, it } from "vitest"
import { PREVIEW_URI } from "../src/preview-resource"
import { createCodeprintServer } from "../src/server"

async function connect(apps: boolean) {
  const [a, b] = InMemoryTransport.createLinkedPair()
  const directory = await mkdtemp(join(tmpdir(), "codeprint-protocol-"))
  const server = createCodeprintServer({ outputDirectory: directory })
  const client = new Client(
    { name: "Codeprint protocol test", version: "1" },
    {
      capabilities: apps
        ? { extensions: { "io.modelcontextprotocol/ui": { mimeTypes: ["text/html;profile=mcp-app"] } } }
        : {},
    },
  )
  await Promise.all([server.connect(b), client.connect(a)])
  return { client, server }
}

describe("PDF resource and app protocol", () => {
  it("makes the linked PDF readable and identical to the saved file", async () => {
    const { client, server } = await connect(false)
    try {
      const result = await client.callTool({
        name: "create_printable_pdf",
        arguments: { content: "# Private notes\n\nReading copy.", filename: "notes.md" },
      })
      expect(result.isError).not.toBe(true)
      const metadata = result.structuredContent as { path: string; resourceUri: string; documentId: string }
      expect(result).toMatchObject({
        content: [
          { type: "text", text: `Created a 1-page PDF at ${metadata.path}\n` },
          { type: "resource_link", uri: metadata.resourceUri, mimeType: "application/pdf" },
          { type: "text", text: JSON.stringify(metadata, null, 2) },
        ],
      })
      const resource = await client.readResource({ uri: metadata.resourceUri })
      const returned = resource.contents[0] as { blob: string; mimeType: string }
      expect(returned.mimeType).toBe("application/pdf")
      expect(Buffer.from(returned.blob, "base64")).toEqual(await readFile(metadata.path))
      expect(
        (await client.callTool({ name: "preview_pdf", arguments: { documentId: metadata.documentId } })).isError,
      ).not.toBe(true)
      await expect(client.readResource({ uri: "file:///etc/passwd" })).rejects.toThrow()
      const tools = await client.listTools()
      expect(tools.tools.find((tool) => tool.name === "create_printable_pdf")?._meta).toBeUndefined()
      expect((await client.listResources()).resources.some((resource) => resource.uri === PREVIEW_URI)).toBe(false)
    } finally {
      await client.close()
      await server.close()
    }
  })
  it("advertises an offline viewer only to an MCP Apps client", async () => {
    const { client, server } = await connect(true)
    try {
      const tools = await client.listTools()
      expect(tools.tools.find((tool) => tool.name === "preview_pdf")?._meta?.ui).toEqual({ resourceUri: PREVIEW_URI })
      const viewer = await client.readResource({ uri: PREVIEW_URI })
      const content = viewer.contents[0] as { text: string; mimeType: string; _meta: unknown }
      expect(content.mimeType).toBe("text/html;profile=mcp-app")
      expect(content.text).toContain("Codeprint preview")
      expect(content.text.includes("CODEPRINT_APP_SCRIPT")).toBe(false)
      expect(content._meta).toMatchObject({ ui: { csp: { connectDomains: [], resourceDomains: [] } } })
    } finally {
      await client.close()
      await server.close()
    }
  })
})

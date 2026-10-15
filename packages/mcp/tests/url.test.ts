import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock("@codeprint/core/source/node", () => ({ importNodeSource: mocks.load }))

import { createCodeprintServer } from "../src/server"

afterEach(() => vi.clearAllMocks())

async function connect() {
  const [a, b] = InMemoryTransport.createLinkedPair()
  const outputDirectory = await mkdtemp(join(tmpdir(), "codeprint-url-test-"))
  const server = createCodeprintServer({ outputDirectory })
  const client = new Client({ name: "URL protocol test", version: "1" })
  await Promise.all([server.connect(b), client.connect(a)])
  return { server, client }
}

describe("MCP URL-to-PDF boundary", () => {
  it("renders source locally, exposes the exact PDF, and never prepares a print job", async () => {
    mocks.load.mockResolvedValue({
      content: "# Public reading copy\n\nReview before printing.",
      filename: "README.md",
      format: "markdown",
      language: "markdown",
      sourceUrl: "https://github.com/owner/repo/blob/main/README.md",
    })
    const { server, client } = await connect()
    try {
      const tools = await client.listTools()
      expect(tools.tools.find((tool) => tool.name === "create_pdf_from_url")?.annotations).toMatchObject({
        openWorldHint: true,
        destructiveHint: false,
      })
      const result = await client.callTool({
        name: "create_pdf_from_url",
        arguments: { url: "https://github.com/owner/repo/blob/main/README.md" },
      })
      expect(result.isError).not.toBe(true)
      const metadata = result.structuredContent as {
        path: string
        format: string
        resourceUri: string
        documentId: string
        confirmationToken?: string
      }
      expect(metadata.format).toBe("markdown")
      expect(metadata.path).toMatch(/README\.pdf$/)
      expect(metadata.confirmationToken).toBeUndefined()
      const resource = await client.readResource({ uri: metadata.resourceUri })
      expect(Buffer.from((resource.contents[0] as { blob: string }).blob, "base64")).toEqual(
        await readFile(metadata.path),
      )
      expect(
        (await client.callTool({ name: "preview_pdf", arguments: { documentId: metadata.documentId } })).isError,
      ).not.toBe(true)
      expect(mocks.load.mock.calls[0][1]).toBeInstanceOf(AbortSignal)
    } finally {
      await client.close()
      await server.close()
    }
  })
  it("returns an actionable error without a document on failed imports", async () => {
    mocks.load.mockRejectedValue(new Error("Only public internet file URLs are supported."))
    const { server, client } = await connect()
    const stderr = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const result = await client.callTool({
        name: "create_pdf_from_url",
        arguments: { url: "https://localhost/secret.py" },
      })
      expect(result.isError).toBe(true)
      expect(JSON.stringify(result.content)).toContain("public internet")
      expect(
        (await client.listResources()).resources.some((item) => item.uri.startsWith("codeprint://documents/")),
      ).toBe(false)
    } finally {
      stderr.mockRestore()
      await client.close()
      await server.close()
    }
  })
})

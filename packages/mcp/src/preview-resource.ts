import { readFile } from "node:fs/promises"
import { getUiCapability, RESOURCE_MIME_TYPE, registerAppResource } from "@modelcontextprotocol/ext-apps/server"
import type { McpServer, RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js"

export const PREVIEW_URI = "ui://codeprint/pdf-preview.html"

export function registerPreview(server: McpServer, tools: RegisteredTool[]) {
  const resource = registerAppResource(
    server,
    "codeprint-pdf-preview",
    PREVIEW_URI,
    { title: "Codeprint PDF preview", description: "Inspect the exact saved PDF, one whole page at a time." },
    async () => ({
      contents: [
        {
          uri: PREVIEW_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: await readFile(new URL("../dist/pdf-preview.html", import.meta.url), "utf8"),
          _meta: { ui: { csp: { connectDomains: [], resourceDomains: [] }, prefersBorder: true } },
        },
      ],
    }),
  )
  // Do not advertise an app to clients that only implement standard MCP.
  resource.disable()
  server.server.oninitialized = () => {
    const capability = getUiCapability(server.server.getClientCapabilities())
    if (!capability?.mimeTypes?.includes(RESOURCE_MIME_TYPE)) return
    resource.enable()
    for (const tool of tools) tool.update({ _meta: { ui: { resourceUri: PREVIEW_URI } } })
  }
}

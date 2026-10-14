#!/usr/bin/env node
import { realpathSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { createCodeprintServer } from "./server"

export { getOutputDirectory, writeRenderedPdf } from "./output"
export { createCodeprintServer } from "./server"

export async function runCodeprintServer() {
  const server = createCodeprintServer()
  await server.connect(new StdioServerTransport())
}

function isEntrypoint() {
  if (!process.argv[1]) return false
  try {
    return pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url
  } catch {
    return false
  }
}

if (isEntrypoint()) {
  runCodeprintServer().catch((error) => {
    console.error("Codeprint MCP server failed to start:", error)
    process.exitCode = 1
  })
}

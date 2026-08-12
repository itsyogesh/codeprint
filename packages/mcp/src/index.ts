#!/usr/bin/env node
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { createCodeprintServer } from "./server"

export { getOutputDirectory, writeRenderedPdf } from "./output"
export { createCodeprintServer } from "./server"

export async function runCodeprintServer() {
  const server = createCodeprintServer()
  await server.connect(new StdioServerTransport())
}

const entrypoint = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null
if (entrypoint === import.meta.url) {
  runCodeprintServer().catch((error) => {
    console.error("Codeprint MCP server failed to start:", error)
    process.exitCode = 1
  })
}

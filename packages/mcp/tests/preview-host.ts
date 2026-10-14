import { mkdtemp } from "node:fs/promises"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { build } from "esbuild"
import { PREVIEW_URI } from "../src/preview-resource"
import { createCodeprintServer } from "../src/server"

// Local visual QA only. It never calls a printing tool or exposes arbitrary files.
const directory = await mkdtemp(join(tmpdir(), "codeprint-viewer-qa-"))
const [a, b] = InMemoryTransport.createLinkedPair()
const mcp = createCodeprintServer({ outputDirectory: directory })
const client = new Client(
  { name: "Codeprint viewer QA", version: "1" },
  { capabilities: { extensions: { "io.modelcontextprotocol/ui": { mimeTypes: ["text/html;profile=mcp-app"] } } } },
)
await Promise.all([mcp.connect(b), client.connect(a)])
const result = await client.callTool({
  name: "create_printable_pdf",
  arguments: {
    format: "markdown",
    filename: "reading-copy.md",
    content:
      "# Codeprint reading copy\n\n" +
      Array.from(
        { length: 28 },
        (_, index) =>
          `## Section ${index + 1}\n\nThis is a local PDF preview test. The page you see is the page in the saved PDF. Printing remains a separate, approved action.\n\n`,
      ).join(""),
  },
})
if (result.isError) throw new Error("QA fixture rendering failed")
const metadata = result.structuredContent as { resourceUri: string }
const pdfResource = await client.readResource({ uri: metadata.resourceUri })
const viewer = await client.readResource({ uri: PREVIEW_URI })
const html = (viewer.contents[0] as { text: string }).text
const source = `
import {AppBridge, PostMessageTransport} from "@modelcontextprotocol/ext-apps/app-bridge";
const fixture = await fetch('/fixture').then(r=>r.json());
const iframe = document.querySelector('iframe');
const bridge = new AppBridge(null,{name:'Codeprint QA host',version:'1'},{serverResources:{},downloadFile:{}});
bridge.onreadresource=async ({uri})=>{if(uri!==fixture.result.structuredContent.resourceUri) throw Error('Unknown resource'); return fixture.resource};
bridge.ondownloadfile=async()=>({isError:true});
bridge.onsizechange=({height})=>{if(height) iframe.style.height=height+'px'};
bridge.oninitialized=async()=>{await bridge.sendToolInput({arguments:{}});await bridge.sendToolResult(fixture.result);document.querySelector('#host-status').textContent='MCP App connected'};
await bridge.connect(new PostMessageTransport(iframe.contentWindow,iframe.contentWindow));
iframe.srcdoc=fixture.html;
`
const bundle = await build({
  stdin: { contents: source, resolveDir: process.cwd() },
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
})
const host = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Codeprint MCP App QA</title><style>body{margin:0;background:#e2e8f0;font-family:system-ui}header{padding:16px;background:#fff}iframe{border:0;width:min(100%,900px);display:block;margin:24px auto}</style></head><body><header>Codeprint MCP Apps test host · <span id="host-status">Connecting</span></header><iframe title="Codeprint PDF viewer" sandbox="allow-scripts"></iframe><script type="module" src="/host.js"></script></body></html>`
const server = createServer((request, response) => {
  if (request.url === "/fixture") {
    response.setHeader("Content-Type", "application/json")
    response.end(JSON.stringify({ html, result, resource: pdfResource }))
  } else if (request.url === "/host.js") {
    response.setHeader("Content-Type", "text/javascript")
    response.end(bundle.outputFiles[0].text)
  } else if (request.url === "/") {
    response.setHeader("Content-Type", "text/html")
    response.end(host)
  } else {
    response.statusCode = 404
    response.end()
  }
})
server.listen(4107, "127.0.0.1", () => console.error("Codeprint MCP viewer QA: http://127.0.0.1:4107"))
async function close() {
  server.close()
  await client.close()
  await mcp.close()
}
process.once("SIGINT", () => {
  void close()
})
process.once("SIGTERM", () => {
  void close()
})

# @codeprint/mcp

Local MCP server for Codeprint PDF creation and confirmed physical printing.

## Installation

Use Node.js 22.12 or newer. No repository checkout or global install is needed.
For Claude Desktop or Cursor, add this server to the client's MCP configuration:

```json
{
  "mcpServers": {
    "codeprint": {
      "command": "npx",
      "args": ["-y", "@codeprint/mcp"]
    }
  }
}
```

Restart or reconnect the client after saving. PDFs are saved to
`~/Downloads/Codeprint` by default. Set `CODEPRINT_OUTPUT_DIR` in the server's
`env` object to choose a different absolute output directory. Keep the client's
per-tool approval controls enabled, especially for physical printing.

For VS Code, use `.vscode/mcp.json` with a `servers` key instead of `mcpServers`
and add `"type": "stdio"` to the server entry.

Keep the server local. It uses stdio, not a public HTTP endpoint, and does not
need a Codeprint account, API key, database, or cloud storage.

## Build from source

For development, build the workspace from the repository root:

```bash
npm ci
npm run build -w @codeprint/core
npm run build -w @codeprint/print
npm run build -w @codeprint/mcp
```

## Client configuration from source

For Claude Desktop or Cursor, replace the absolute path below with your checkout.

```json
{
  "mcpServers": {
    "codeprint": {
      "command": "node",
      "args": ["/absolute/path/to/codeprint/packages/mcp/dist/index.js"],
      "env": {
        "CODEPRINT_OUTPUT_DIR": "/absolute/path/to/Codeprint"
      }
    }
  }
}
```

VS Code uses `.vscode/mcp.json` with a `servers` key instead of `mcpServers`:

```json
{
  "servers": {
    "codeprint": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/codeprint/packages/mcp/dist/index.js"]
    }
  }
}
```

Codex and Claude Code can register the local executable through their CLIs:

```bash
codex mcp add codeprint -- node /absolute/path/to/codeprint/packages/mcp/dist/index.js
claude mcp add --transport stdio codeprint -- node /absolute/path/to/codeprint/packages/mcp/dist/index.js
```

Restart or reconnect the client after configuration. The source configurations
above are for local development; use the npm configuration under Installation
for the published release.

## PDF tools

`create_printable_pdf` supports Markdown, code, and CSV. For JSON, pass `format: "code"`, `language: "json"`, and a `.json` filename. Existing files are never overwritten.

It returns the saved file path, paper page count, byte size, document ID, and a
`codeprint://documents/{documentId}` PDF resource. A client can read that URI
through standard MCP `resources/read`; the response contains base64 PDF bytes,
identical to the saved file. The bytes are not embedded in the model-facing tool
result. Only documents created by this server session can be read. Arbitrary
filesystem paths cannot be read through these resources.

`preview_pdf` reopens a document using its returned document ID. It does not
regenerate, modify, download, or print it.

## Inline PDF previews

Clients advertising the MCP Apps `text/html;profile=mcp-app` capability receive
a tool-linked viewer resource. The viewer renders the exact PDF using bundled
PDF.js and includes page navigation, a full-height paper page, light/dark host
theme support, and a host-mediated Save PDF button when supported. It has no
external font, CDN, analytics, or document-upload dependency. The Codeprint fonts
are embedded in the viewer.

Plain MCP clients still receive the PDF resource and local file path. MCP tool
support does not guarantee MCP Apps support. A terminal client may provide no
inline UI at all.

Preview resources are bounded to 20 PDFs and 64 MiB per server session. Oldest
resources expire when either limit is reached. Restarting the server expires all
resource IDs. Saved PDFs are unaffected; recreate the preview if its ID expires.

## Print tools

1. Call `list_printers` and optionally `get_printer_capabilities`.
2. Call `prepare_print_job` with the local PDF path and requested settings.
3. Show the returned summary to the user.
4. Call `submit_print_job` only after explicit approval.

The preparation includes the PDF's `contentSha256` identity and freezes its bytes,
printer, and options for that token. Show the filename, identity, and settings
when requesting approval. Changed or replaced source files require a fresh
preparation and approval. CUPS receives the approved bytes through standard input,
not by reopening a mutable file path.

The confirmation token expires after five minutes and can be used only once,
including after a failed submission. Pending PDF snapshots stay in bounded local
memory and are cleared on submission, expiry, or client disconnect. They are not
written to additional temporary files. `list_print_jobs` and `cancel_print_job`
expose the local spooler queue.

Document content is not sent to Codeprint or another cloud service.

The assistant client itself receives the document and PDF resources. Its own
privacy policy and permissions still apply. A preparation token validates one
job; it is not proof that an agent obtained human consent. Keep the client’s
tool-approval controls enabled for `submit_print_job` and `cancel_print_job`.

## Plugins and browser agents

The repository includes a Claude Code **development** plugin at
`integrations/claude`. After building, run from the repository root:

```bash
claude --plugin-dir ./integrations/claude
```

This plugin deliberately references the sibling MCP package. It is for a full
repository checkout, not a standalone marketplace ZIP. A distributable plugin
must use a published package or bundle its server and dependencies.

The web app also includes a feature-gated WebMCP experiment. In supported
browsers, it stages agent-supplied Markdown, code/JSON, or CSV for visible user
review before replacing editor content. It does not expose physical printing,
automatic downloads, existing source text, or an HTTP filesystem bridge. The
October 2026 WebMCP draft remains experimental; the beta is disabled by default.

Hosted ChatGPT connectors require a separate HTTPS service, authentication,
storage lifecycle, and an explicit cloud-processing privacy policy. Do not
expose this local printer server through an unauthenticated tunnel.

## Verification

```bash
npm run typecheck -w @codeprint/mcp
npm run test:run -w @codeprint/mcp
npm run mcp:smoke
node --import tsx packages/mcp/tests/preview-host.ts
```

The last command starts a loopback-only sample viewer at
`http://127.0.0.1:4107`. It never calls a physical-printing tool. The protocol
tests cover plain clients, MCP Apps capability negotiation, exact PDF resources,
and rejection of arbitrary file reads. The print smoke test uses a fake printer;
it is not a substitute for testing real CUPS printers before publishing.

## License

GNU AGPL version 3 only. Commercial use is allowed subject to the AGPL. The
full license is included with the package.

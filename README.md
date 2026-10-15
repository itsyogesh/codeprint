# Codeprint

Codeprint turns code, Markdown, JSON, and CSV into readable, paginated PDFs. The same document engine powers the web app, a local CLI, and an MCP server for agents.

Document rendering happens locally. Direct printer submission is available only through the CLI and MCP packages, and every print job has an explicit preparation and confirmation boundary.

## Table of contents

- [Products](#products)
- [Key features](#key-features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [CLI](#cli)
- [MCP server](#mcp-server)
- [Direct printing](#direct-printing)
- [Development commands](#development-commands)
- [Testing](#testing)
- [Deployment and publishing](#deployment-and-publishing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Products

| Surface | Package or app | Purpose |
| --- | --- | --- |
| Web | `@codeprint/web` | Browser preview, PDF download, and browser-managed printing |
| Core | `@codeprint/core` | Canonical settings, PDF components, and document rendering |
| Print | `@codeprint/print` | Printer discovery, capabilities, safe preparation, submission, status, and cancellation |
| CLI | `@codeprint/cli` | Terminal rendering and direct local printing through the `codeprint` command |
| MCP | `@codeprint/mcp` | Agent-facing PDF and local printer tools over stdio |

## Key features

- Print-ready PDFs for Markdown, code, JSON, and CSV
- Shared PDF implementation across web, CLI, and MCP
- Syntax highlighting for the supported programming languages
- Markdown headings, lists, tables, links, code blocks, and optional table of contents
- Print-safe Mermaid diagrams inside Markdown. Flowchart, state, sequence, class, and ER diagrams render at 300 PPI; unsupported families preserve their source with a warning
- CSV headers and alternating row colors
- A4, Letter, and Legal paper in portrait or landscape
- Local printer discovery through CUPS on macOS and Linux
- Two-step printing with short-lived, single-use confirmation tokens
- Local-only document handling with no Codeprint upload service

## Architecture

```text
apps/web ───────────────────────────────┐
                                       ├──> packages/core
packages/cli ───────┬──> packages/print│
                    └───────────────────┤
packages/mcp ───────┬──> packages/print│
                    └───────────────────┘
```

### Directory structure

```text
codeprint/
├── apps/
│   └── web/                  Next.js application
├── packages/
│   ├── core/                 Document types and PDF rendering
│   ├── print/                Native print adapters and confirmation service
│   ├── cli/                  `codeprint` executable
│   └── mcp/                  `codeprint-mcp` executable
├── CONTRIBUTING.md           Contributor workflow and quality gates
├── SECURITY.md               Private vulnerability reporting policy
├── THIRD_PARTY_NOTICES.md    Bundled dependency and asset notices
├── biome.json                Workspace formatting and linting
├── tsconfig.base.json        Shared TypeScript settings
└── package.json              npm workspace orchestration
```

### Document flow

1. A surface normalizes the source, filename, format, and paper settings.
2. `@codeprint/core` creates the React PDF document and final PDF bytes.
3. The web app downloads those bytes or opens the browser print flow.
4. The CLI and MCP server can write the PDF locally.
5. If physical printing is requested, `@codeprint/print` validates the PDF and printer capabilities before creating a confirmation token.
6. A separate submission consumes the token and sends the PDF to the operating system spooler.

Printer integrations do not live in `core`. This keeps the document engine portable and prevents native Node dependencies from entering the web application.

## Prerequisites

- Node.js 22.12 or newer
- npm 10 or newer
- For direct printing on macOS or Linux: CUPS commands `lpstat`, `lpoptions`, `lp`, and `cancel`

Windows can render PDFs today, but direct printer submission is not implemented yet. Print the generated PDF through the system viewer on Windows.

## Getting started

Install all workspace dependencies from the repository root:

```bash
npm install
```

Start the web application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Build every package and the production web application:

```bash
npm run build
```

## CLI

Run the CLI from the repository:

```bash
npm run cli -- --help
```

Run the published CLI without a permanent install:

```bash
npx @codeprint/cli render README.md
```

### Render documents

```bash
codeprint render README.md
codeprint render report.csv --page-size letter --orientation landscape
codeprint render payload.json --output ./printouts
codeprint render source.ts --language typescript --no-line-numbers
cat notes.md | codeprint render - --format markdown --filename notes.md
```

The CLI infers Markdown, CSV, JSON, and programming languages from file extensions. JSON uses the code renderer with JSON syntax highlighting. Markdown Mermaid fences render flowchart, state, sequence, class, and ER diagrams. Other Mermaid families remain readable as source code and include a concise warning. There is no dedicated Mermaid route yet.

An existing output file is never replaced unless `--force` is supplied.

### Print documents

```bash
codeprint printers
codeprint printer-info "Office_Printer"
codeprint print README.md --printer "Office_Printer" --duplex two-sided-long-edge
codeprint print report.pdf --copies 2 --page-ranges 1-3,7
codeprint jobs
codeprint cancel Office_Printer-42
```

`codeprint print` displays the resolved printer, copies, paper, duplex, color, and page range before asking for confirmation. Automation may pass `--yes`, but callers should display and approve the settings first.

Use `--json` for machine-readable output:

```bash
codeprint --json printers
codeprint --json render README.md --output ./out
```

See [packages/cli/README.md](packages/cli/README.md) for the full option reference.

## MCP server

Run the server over stdio:

```bash
npm run mcp:start
```

An MCP client can launch the published package with:

```json
{
  "mcpServers": {
    "codeprint": {
      "command": "npx",
      "args": ["-y", "@codeprint/mcp"],
      "env": {
        "CODEPRINT_OUTPUT_DIR": "/absolute/path/to/Codeprint"
      }
    }
  }
}
```

Available tools:

| Tool | Effect |
| --- | --- |
| `create_printable_pdf` | Writes a new local PDF without overwriting an existing file |
| `create_pdf_from_url` | Fetches one public GitHub or HTTPS text file and creates a local PDF for review; never prints |
| `preview_pdf` | Reopens an exact PDF created during the current server session |
| `list_printers` | Lists configured printers |
| `get_printer_capabilities` | Reads paper, duplex, and color options |
| `prepare_print_job` | Validates a PDF and returns exact settings plus a short-lived token |
| `submit_print_job` | Sends one previously prepared job to the physical printer |
| `list_print_jobs` | Lists incomplete jobs |
| `cancel_print_job` | Cancels a queued job |

The MCP instructions require explicit user approval between `prepare_print_job` and `submit_print_job`. A token expires after five minutes and cannot be reused.

See [packages/mcp/README.md](packages/mcp/README.md) for examples and client configuration.

## Importing public files by URL

The website's **Import URL** control loads a public GitHub file link or a direct
HTTPS text-file URL. Review the fetched file before replacing editor content.
Codeprint offers the matching code, Markdown, or CSV editor when needed. The
cross-editor handoff uses one-shot tab-local session storage with a one-minute
expiry, not URL parameters. No import happens just by visiting a link.

Browser imports contact the source host directly with no cookies or referrer;
there is no Codeprint fetch proxy. Hosts that block CORS or redirect require a
public Raw link or a download-and-upload fallback. A browser cannot inspect DNS
answers; the website rejects literal private addresses and local hostnames,
and browser network/security policies still apply to other hosts.

The CLI supports `codeprint render --url 'https://github.com/itsyogesh/codeprint/blob/main/README.md'`.
MCP exposes `create_pdf_from_url`. Both fetch locally using connection-time DNS
validation, reject private/special-use IPs and redirects, and never forward
authentication. All surfaces cap imports at 2 MiB and 15 seconds, require UTF-8
text, and do not execute it. PDF generation stays on the user's device. Imports
do not bypass the normal physical-printing approval flow. Private repositories,
whole repositories, arbitrary web-page extraction, and authenticated URLs are
outside this release.

## Direct printing

The first print adapter targets CUPS on macOS and Linux. It calls native commands with argument arrays and never invokes a shell, so printer names and file paths are not evaluated as commands.

The print service validates:

- The source exists and begins with a PDF file signature
- The requested printer exists
- Copies are between 1 and 99
- Page ranges contain positive, ascending ranges
- Requested paper, duplex, and color modes are reported by the printer when capability data is available

Preparing a job does not print. Submission requires the returned single-use token.

## Environment variables

| Variable | Used by | Description | Default |
| --- | --- | --- | --- |
| `CODEPRINT_OUTPUT_DIR` | MCP | Directory for generated PDFs | `~/Downloads/Codeprint` |
| `NEXT_PUBLIC_SHOW_DEVELOPER_TOOLS` | Web | Reveals CLI and MCP discovery links, homepage section, sitemap entries, and indexable metadata | `false` |

The web app does not require environment variables for document rendering. Copy `apps/web/.env.example` to `apps/web/.env.local` only when you need to preview the developer-tool launch state.

## Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Build core and start the Next.js development server |
| `npm run build` | Build all packages and the production web app in dependency order |
| `npm run cli -- --help` | Run the source CLI |
| `npm run mcp:start` | Start the source MCP server over stdio |
| `npm run mcp:smoke` | Exercise PDF creation and the confirmed print flow with a fake printer |
| `npm run release:check` | Run the complete release verification and inspect all package tarballs |
| `npm run typecheck` | Build shared packages, then typecheck every workspace |
| `npm run test:run` | Run all non-interactive test suites |
| `npm run lint` | Run Biome linting across the workspace |
| `npm run check` | Run Biome formatting and lint checks without modifying files |
| `npm run format` | Format workspace files |

## Testing

Run all tests once:

```bash
npm run test:run
```

Run the MCP integration smoke test:

```bash
npm run mcp:smoke
```

The print unit tests use a fake backend. They do not submit jobs to a physical printer. The MCP smoke test also uses a fake printer and a temporary output directory.

For a complete verification pass:

```bash
npm run release:check
```

## Deployment and publishing

The web app in `apps/web` is a standard Next.js application and can be deployed to Vercel. Configure the project root as the repository root and use `npm run build`; the workspace build compiles shared packages before Next.js.

The public packages belong to the `@codeprint` npm organization. Releases publish in dependency order: core, print, CLI, then MCP.

Before every release:

1. Update the package versions and exact internal dependency versions together.
2. Run `npm run release:check` on Node.js 22 and 24.
3. Confirm the release commit is on the protected default branch of `itsyogesh/codeprint`.
4. Confirm the public history contains no private prompts, research, credentials, generated documents, or personal files.
5. Verify the deployed source link resolves to the exact public release.

Each package uses a GitHub Actions trusted publisher on npm:

- Repository owner: `itsyogesh`
- Repository: `codeprint`
- Workflow: `publish-packages.yml`
- Environment: `npm`
- Allowed action: `npm publish`

The manual `Publish npm packages` workflow then verifies and publishes all four packages without a stored npm token. No package is published by the normal build scripts.

## Troubleshooting

### `lpstat is not installed or is not available on PATH`

Install or enable CUPS. macOS normally includes the required commands. On Debian or Ubuntu, install the CUPS client tools:

```bash
sudo apt-get install cups-client
```

### No printers are configured

Verify the operating system can see a printer:

```bash
lpstat -p -d
```

Add the printer through system settings or CUPS, then retry `codeprint printers`.

### Requested capability is rejected

Inspect the printer-reported options:

```bash
codeprint printer-info "Printer_ID"
```

Printer IDs can differ from display names and commonly replace spaces with underscores.

### Output file already exists

Choose another output path or explicitly allow replacement:

```bash
codeprint render README.md --output README-print.pdf --force
```

### CJK, Arabic, Indic, or complex emoji text is not rendered correctly

The first release embeds fonts for exact Latin and Cyrillic output. Locale-specific
CJK packs, right-to-left Arabic extraction, Indic extraction, and joined emoji
sequences are not supported yet. Do not distribute a PDF containing those scripts
without inspecting both the rendered pages and copied text. The public roadmap
tracks the language-pack work; Codeprint will not claim support until visual and
text-extraction fixtures both pass.

### MCP client cannot find the executable

Use an absolute Node or `npx` path in the client configuration, or install `@codeprint/mcp` globally.

## Privacy

Codeprint does not need a document API. The web app renders in the browser. The CLI and MCP server render on the local computer. Direct printing sends the PDF only to the configured operating-system print service or printer.

## License

Codeprint's original source is open source under
[GNU AGPL version 3 only](LICENSE), identified as `AGPL-3.0-only`. Personal and
commercial use are allowed. Distribution and network use of modified covered
versions must follow the source-availability and copyleft conditions in the
license. Copyright 2026 Yogesh Kumar.

PDFs created from your own material are not placed under the AGPL merely because
Codeprint generated them. Read
[Open source and sustainability](docs/OPEN_SOURCE_AND_SUSTAINABILITY.md) for the
plain-language project decision, future business model, and trademark boundary.

See [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes,
[SECURITY.md](SECURITY.md) for private vulnerability reporting, and
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for licenses that apply to
bundled dependencies, fonts, and externally served icons.

The Codeprint name and logo are not granted for use by the AGPL.

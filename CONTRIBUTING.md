# Contributing to Codeprint

Thank you for helping make Codeprint a dependable way to turn source material
into readable PDFs. Contributions are welcome across the web app, rendering
core, CLI, MCP server, and local printing packages.

## Ground rules

- Keep document contents local. Do not add telemetry, uploads, remote rendering,
  or filename collection without an explicit public design and privacy review.
- Keep private prompts, research notes, and working plans outside this
  repository. Public decisions should be documented as product behavior,
  architecture, tests, or user-facing documentation.
- Preserve the two-step boundary between preparing and submitting a physical
  print job. Preparation must never have the side effect of printing.
- Treat document text, Markdown, CSV, diagram source, filenames, paths, printer
  names, and MCP arguments as untrusted input.
- Do not add generated PDFs, local printer output, credentials, environment
  files, or personal test documents to a pull request.

## Set up the workspace

Requirements:

- Node.js 22.12 or newer
- npm 10 or newer
- CUPS client commands only when developing direct printing on macOS or Linux

Install dependencies and run the web app:

```bash
npm install
npm run dev
```

The repository is an npm workspace. Make shared behavior changes in the lowest
appropriate package instead of copying logic between surfaces.

| Area | Responsibility |
| --- | --- |
| `apps/web` | Browser workflow, actual-PDF preview, download, and marketing pages |
| `packages/core` | Canonical settings, parsing, fonts, diagrams, and PDF rendering |
| `packages/print` | Printer discovery, validation, confirmation, submission, and cancellation |
| `packages/cli` | Terminal interface for rendering and local printing |
| `packages/mcp` | Agent-facing tools over stdio |

## Make a focused change

For a substantial feature, open an issue or discussion before implementation so
the behavior, safety boundary, and test strategy can be agreed first. Keep pull
requests small enough to review and avoid unrelated formatting or dependency
changes.

### PDF and typography changes

- Keep `@codeprint/core` as the canonical source for preview and downloaded PDF
  behavior.
- Use bundled local fonts. Runtime font downloads are not acceptable in the
  document pipeline.
- Add regression fixtures for pagination, extracted text, and font embedding
  when changing layout or typography.
- Keep code, CSV values, and identifiers free from automatic hyphenation.
- Mermaid support is intentionally limited to print-safe flowchart, state,
  sequence, class, and ER families. New families require hostile-input tests,
  deterministic Node/browser output, and a readable source fallback.

### Printing changes

- Pass native command arguments as arrays. Never interpolate printer data into
  a shell command.
- Validate printer identity and requested capabilities before preparing a job.
- Keep confirmation tokens short-lived and single-use.
- Unit and integration tests must use a fake adapter unless a maintainer has
  explicitly opted into a real-printer test.

### Web changes

- Keep the actual generated PDF as the preview source.
- Preserve keyboard operation, reduced-motion behavior, and light and dark
  themes.
- Avoid sending document contents or filenames to analytics, logging, or
  external assets.
- Include screenshots for visible changes at representative desktop and mobile
  widths.

## Verify the change

Run the narrowest relevant tests while developing. Before requesting review,
run the complete local verification pass:

```bash
npm run check
npm run typecheck
npm run test:run
npm run build
npm run mcp:smoke
```

The MCP smoke test uses a fake printer. It does not authorize a physical print
job. If your change affects package contents, also inspect the relevant package:

```bash
npm pack --dry-run -w @codeprint/core
```

Use the equivalent workspace name for other packages. PDF rendering changes
should also be checked with the available Poppler inspection tools so text
extraction, embedded fonts, page count, and image resolution remain intentional.

## Pull request checklist

- Explain the user-visible outcome and the reason for the change.
- Link the relevant issue or discussion when one exists.
- Describe the tests and manual checks you ran.
- Call out privacy, printing, dependency, or compatibility implications.
- Add or update public documentation for changed behavior.
- Confirm that no private workbench artifacts or generated documents are present.
- Keep commits understandable and do not rewrite shared history after review has
  started unless a maintainer asks you to.

## Security reports

Do not open a public issue for a suspected vulnerability. Follow
[SECURITY.md](SECURITY.md) to report it privately.

## Licensing

Unless explicitly stated otherwise, contributions are accepted under the
repository's [GNU AGPL version 3 only](LICENSE). By submitting a contribution,
you agree to license it under `AGPL-3.0-only`. Only submit work you have the
right to license, and preserve third-party notices when modifying bundled
assets or dependencies. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Codeprint does not currently require a contributor license agreement or offer a
separate proprietary license. Any future contributor terms will be proposed
publicly before they apply to new contributions. See
[Open source and sustainability](docs/OPEN_SOURCE_AND_SUSTAINABILITY.md).

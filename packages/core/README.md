# @codeprint/core

Shared document types and PDF rendering for Codeprint. This package owns the canonical PDF components and settings used by the web app, CLI, and MCP server.

## Entry points

- `@codeprint/core`: document types, defaults, validation, and safe filename helpers
- `@codeprint/core/pdf`: React PDF document components and Markdown PDF finalization for browser use
- `@codeprint/core/highlight`: shared syntax-highlighting loader
- `@codeprint/core/render`: Node PDF byte rendering for CLI and MCP

```typescript
import { renderPrintablePdf } from "@codeprint/core/render"

const result = await renderPrintablePdf({
  content: "# Review notes",
  format: "markdown",
  filename: "review.md",
  pageSize: "a4",
})

console.log(result.pages, result.suggestedFilename)
```

`core` does not write files, discover printers, or submit print jobs.

## License

GNU AGPL version 3 only. Commercial use is allowed subject to the AGPL. PDFs
created from user material are not placed under the AGPL merely because this
package rendered them. The full license is included with the package.

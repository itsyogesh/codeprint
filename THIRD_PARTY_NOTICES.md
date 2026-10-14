# Third-party notices

Codeprint's original source is licensed under the repository's
[GNU AGPL version 3 only](LICENSE). The components and assets below remain under
their own licenses. This notice is informational and does not replace the
license text included by each upstream project.

The dependency versions used by a particular build are recorded in
`package-lock.json`. Full dependency license texts are included in their npm
distributions. Bundled font license texts are retained beside the font files.

## Bundled fonts

| Font | Copyright | License | Local license |
| --- | --- | --- | --- |
| Mulish | Copyright 2016 The Mulish Project Authors | SIL Open Font License 1.1 | `packages/core/assets/fonts/mulish/OFL.txt` |
| Merriweather | Copyright 2016 The Merriweather Project Authors; Reserved Font Name "Merriweather" | SIL Open Font License 1.1 | `packages/core/assets/fonts/merriweather/OFL.txt` |
| Source Code Pro | Copyright 2023 Adobe; Reserved Font Name "Source" | SIL Open Font License 1.1 | `packages/core/assets/fonts/source-code-pro/OFL.md` |
| Geist | Copyright 2024 The Geist Project Authors | SIL Open Font License 1.1 | `apps/web/public/fonts/OFL.txt` |

The OFL permits embedding these fonts in generated documents. Documents created
with the fonts are not themselves placed under the OFL. Modified font files must
continue to follow the relevant OFL terms and Reserved Font Name conditions.

## Diagram rendering

### Beautiful Mermaid

- Project: [lukilabs/beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid)
- Copyright: Copyright 2026 Craft Docs
- License: MIT
- Use: Parses and renders the print-safe Mermaid subset before SVG hardening.

### resvg WebAssembly

- Project: [yisibl/resvg-js](https://github.com/yisibl/resvg-js)
- License: Mozilla Public License 2.0
- Use: The `@resvg/resvg-wasm` executable is bundled in the core Node and browser
  raster adapters that create deterministic diagram PNGs.

Codeprint does not relicense the resvg covered software. The corresponding source
and MPL-2.0 text are available from the upstream project and the exact npm
package identified by `package-lock.json`. Codeprint's AGPL-licensed files form
a larger work and remain under AGPL-3.0-only, subject to the MPL requirements
for the resvg covered files.

The published `@codeprint/core` package carries its own distributed notice at
`packages/core/THIRD_PARTY_NOTICES.md` so the MPL and corresponding-source
information travels with the bundled WebAssembly executable.

## PDF creation and preview

### React PDF renderer

- Project: [diegomura/react-pdf](https://github.com/diegomura/react-pdf)
- Copyright: Copyright 2017-present Diego Muracciole
- License: MIT
- Use: `@react-pdf/renderer` creates the canonical PDF in browsers and Node.

### React-PDF viewer

- Project: [wojtekmaj/react-pdf](https://github.com/wojtekmaj/react-pdf)
- Copyright: Copyright 2017-2024 Wojciech Maj
- License: MIT
- Use: Displays actual generated PDF pages in the browser.

### PDF.js

- Project: [mozilla/pdf.js](https://github.com/mozilla/pdf.js)
- License: Apache License 2.0
- Use: The `pdfjs-dist` browser library and worker are distributed through the
  React-PDF preview surface and the offline MCP Apps PDF viewer.

PDF.js is Apache-2.0. The two React PDF projects listed above are MIT; they are
separate projects with different purposes and should not be attributed to the
PDF.js license.

### MCP Apps SDK

- Project: [modelcontextprotocol/ext-apps](https://github.com/modelcontextprotocol/ext-apps)
- Use: Negotiates optional, sandboxed PDF previews with compatible MCP clients.
- License: The installed SDK retains its upstream licensing-transition notice,
  Apache-2.0 text, and MIT text for contributions that have not been relicensed.
  Its full `LICENSE` is copied into `@codeprint/mcp` at `dist/licenses/MCP-Apps-LICENSE.txt`.

The MCP package also distributes PDF.js's Apache-2.0 text and the Mulish and
Merriweather OFL texts alongside the self-contained viewer.

### pdf-lib

- Project: [Hopding/pdf-lib](https://github.com/Hopding/pdf-lib)
- Copyright: Copyright 2019 Andrew Dillon
- License: MIT
- Use: Final PDF assembly and metadata operations.

## Parsing, highlighting, and interface assets

### highlight.js

- Project: [highlightjs/highlight.js](https://github.com/highlightjs/highlight.js)
- Copyright: Copyright 2006 Ivan Sagalaev
- License: BSD 3-Clause
- Use: Programming-language syntax highlighting.

### Marked

- Project: [markedjs/marked](https://github.com/markedjs/marked)
- Copyright: Copyright 2018-present MarkedJS; Copyright 2011-2018 Christopher Jeffrey
- License: MIT
- Use: Markdown parsing.

### Lucide

- Project: [lucide-icons/lucide](https://github.com/lucide-icons/lucide)
- Copyright: Lucide Contributors; portions derived from Feather are copyright Cole Bemis
- License: ISC, with Feather-derived portions under MIT
- Use: Interface icons bundled through `lucide-react`.

### Devicon

- Project: [devicons/devicon](https://github.com/devicons/devicon)
- Copyright: Copyright 2015 konpa and Devicon contributors
- License: MIT
- Use: Language logo SVGs are loaded at runtime from the Devicon distribution on
  jsDelivr. They are not copied into the repository.

Names and logos represented by Devicon may also be trademarks of their respective
owners. Open-source licensing of an icon asset does not grant trademark rights or
endorsement.

## Keeping this notice current

When adding or materially changing a bundled dependency, font, icon source,
WebAssembly module, or generated asset:

1. Verify its license from the installed package and upstream repository.
2. Preserve required copyright, license, source-offer, and trademark notices.
3. Update this file and any package-specific distributed notice.
4. Inspect npm tarballs and production browser assets before release.

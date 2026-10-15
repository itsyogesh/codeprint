# Third-party notices for @codeprint/core

`@codeprint/core` is licensed under GNU AGPL version 3 only except for the
third-party components and assets identified below. Those components remain
under their own licenses.

## Bundled resvg WebAssembly executable

The Node and browser editorial rasterizers bundle executable code from
`@resvg/resvg-wasm` version 2.6.2.

- Project: [resvg-js](https://github.com/yisibl/resvg-js)
- Package: [@resvg/resvg-wasm 2.6.2](https://www.npmjs.com/package/@resvg/resvg-wasm/v/2.6.2)
- License: [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/)
- Corresponding source: [resvg-js v2.6.2](https://github.com/yisibl/resvg-js/tree/v2.6.2)

This Source Code Form is subject to the terms of the Mozilla Public License,
version 2.0. If a copy of the MPL was not distributed with this file, you can
obtain one at <https://mozilla.org/MPL/2.0/>.

Codeprint does not modify or relicense the resvg covered software. Codeprint's
AGPL-licensed files are a larger work and remain under AGPL-3.0-only, subject to
the MPL requirements for the bundled resvg covered files.

## Beautiful Mermaid

- Project: [lukilabs/beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid)
- Copyright: Copyright 2026 Craft Docs
- License: MIT
- Use: Print-safe Mermaid parsing and SVG generation.

## React PDF renderer

- Project: [diegomura/react-pdf](https://github.com/diegomura/react-pdf)
- Copyright: Copyright 2017-present Diego Muracciole
- License: MIT
- Use: PDF document layout and rendering.

React PDF is separate from Mozilla PDF.js. React PDF is MIT; PDF.js is
Apache-2.0 and is distributed by Codeprint's web preview package, not bundled in
this core package.

## PDF and text processing

- [ipaddr.js](https://github.com/whitequark/ipaddr.js), MIT: IP address parsing
  and public-network validation for source imports. Upstream license text is
  included in its dependency distribution.

- [pdf-lib](https://github.com/Hopding/pdf-lib), copyright 2019 Andrew
  Dillon, MIT: PDF assembly and metadata operations.
- [highlight.js](https://github.com/highlightjs/highlight.js), copyright
  2006 Ivan Sagalaev, BSD 3-Clause: syntax highlighting.
- [Marked](https://github.com/markedjs/marked), copyright MarkedJS and
  Christopher Jeffrey, MIT: Markdown parsing.

The complete license texts for these dependencies are included in their npm
distributions. Exact resolved versions are recorded in the package lockfile of
the source distribution.

## Bundled fonts

- Mulish, copyright 2016 The Mulish Project Authors, SIL Open Font License 1.1
- Merriweather, copyright 2016 The Merriweather Project Authors, SIL Open Font
  License 1.1, Reserved Font Name "Merriweather"
- Source Code Pro, copyright 2023 Adobe, SIL Open Font License 1.1, Reserved
  Font Name "Source"

The full OFL text for each family is distributed under `assets/fonts` in this
package. The OFL permits embedding the fonts in generated documents. Generated
documents are not themselves placed under the OFL.

import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    pdf: "src/pdf.ts",
    "highlight-entry": "src/highlight-entry.ts",
    fonts: "src/fonts.ts",
    render: "src/render.tsx",
    editorial: "src/editorial/index.ts",
    "editorial-node": "src/editorial/node.ts",
    "editorial-browser": "src/editorial/browser.ts",
    markdown: "src/markdown.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  splitting: true,
  platform: "neutral",
  target: "es2022",
  loader: {
    ".ttf": "dataurl",
    ".wasm": "binary",
  },
  noExternal: ["@resvg/resvg-wasm"],
})

import { createPrintAssetRasterizer } from "./rasterizer"
import { createBundledResvgBackend } from "./resvg-wasm-backend"

export { createCodeprintMermaidBlockRenderer } from "./beautiful-mermaid-actual"
export type { RasterizePrintAssetOptions } from "./rasterizer"

export const resvgBrowserRasterizer = createPrintAssetRasterizer(createBundledResvgBackend("resvg-wasm-browser"))

import { initWasm, Resvg } from "@resvg/resvg-wasm"
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm?codeprint-binary"
import { MULISH_LOCAL_FONT } from "../fonts/mulish"
import { SOURCE_CODE_PRO_LOCAL_FONT } from "../fonts/source-code-pro"
import { EditorialRenderError } from "./limits"
import type { RasterBackendOptions, RasterBackendResult, SvgRasterBackend } from "./rasterizer"

let initialization: Promise<void> | undefined
let fontBuffers: Uint8Array[] | undefined

function decodeFontDataUrl(dataUrl: string): Uint8Array {
  const marker = ";base64,"
  const markerIndex = dataUrl.indexOf(marker)
  if (!dataUrl.startsWith("data:font/") || markerIndex < 0) {
    throw new EditorialRenderError("UNSAFE_SVG", "Local raster font is not a bundled font data URL")
  }
  const decode = globalThis.atob
  if (!decode) throw new Error("This runtime does not provide base64 decoding")
  const binary = decode(dataUrl.slice(markerIndex + marker.length))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function localFontBuffers(): Uint8Array[] {
  fontBuffers ??= [...MULISH_LOCAL_FONT.faces, ...SOURCE_CODE_PRO_LOCAL_FONT.faces].map((face) =>
    decodeFontDataUrl(face.src),
  )
  return fontBuffers
}

async function ensureResvgInitialized(): Promise<void> {
  initialization ??= initWasm(resvgWasm).catch((error: unknown) => {
    if (error instanceof Error && error.message.includes("Already initialized")) return
    initialization = undefined
    throw error
  })
  await initialization
}

export function createBundledResvgBackend(id: string): SvgRasterBackend {
  return Object.freeze({
    id,
    async render(svg: string, options: RasterBackendOptions): Promise<RasterBackendResult> {
      await ensureResvgInitialized()
      const renderer = new Resvg(svg, {
        background: options.background,
        dpi: 96,
        fitTo: { mode: "zoom", value: options.scale },
        languages: ["en"],
        shapeRendering: 2,
        textRendering: 2,
        imageRendering: 0,
        font: {
          fontBuffers: localFontBuffers(),
          defaultFontFamily: "Mulish",
          sansSerifFamily: "Mulish",
          serifFamily: "Mulish",
          monospaceFamily: "Source Code Pro",
          cursiveFamily: "Mulish",
          fantasyFamily: "Mulish",
        },
      })
      let rendered: ReturnType<InstanceType<typeof Resvg>["render"]> | undefined
      try {
        if (renderer.imagesToResolve().length > 0) {
          throw new EditorialRenderError("UNSAFE_SVG", "Rasterized SVG requested an external image")
        }
        rendered = renderer.render()
        return {
          bytes: new Uint8Array(rendered.asPng()),
          width: rendered.width,
          height: rendered.height,
        }
      } finally {
        rendered?.free()
        renderer.free()
      }
    },
  })
}

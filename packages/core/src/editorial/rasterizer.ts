import { EditorialRenderError, stableEditorialHash, withEditorialDeadline } from "./limits"
import type { RasterPrintAsset, VectorPrintAsset } from "./model"
import type { EditorialRenderContext } from "./renderer"

export interface RasterBackendResult {
  bytes: Uint8Array
  width: number
  height: number
}

export interface RasterBackendOptions {
  scale: number
  background: string
}

export interface SvgRasterBackend {
  readonly id: string
  render(svg: string, options: RasterBackendOptions): Promise<RasterBackendResult>
}

export interface RasterizePrintAssetOptions {
  /** CSS pixels to output pixels. 3.125 corresponds to 300 DPI. */
  scale?: number
}

export interface PrintAssetRasterizer {
  readonly id: string
  rasterize(
    asset: VectorPrintAsset,
    context: EditorialRenderContext,
    options?: RasterizePrintAssetOptions,
  ): Promise<RasterPrintAsset>
}

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const

function assertPng(bytes: Uint8Array): void {
  if (PNG_SIGNATURE.some((value, index) => bytes[index] !== value)) {
    throw new EditorialRenderError("INVALID_SVG", "Raster backend did not return a valid PNG")
  }
}

export function createPrintAssetRasterizer(backend: SvgRasterBackend): PrintAssetRasterizer {
  const rasterizer: PrintAssetRasterizer = {
    id: backend.id,
    async rasterize(
      asset: VectorPrintAsset,
      context: EditorialRenderContext,
      options: RasterizePrintAssetOptions = {},
    ): Promise<RasterPrintAsset> {
      const scale = options.scale ?? 300 / 96
      if (!Number.isFinite(scale) || scale <= 0 || scale > 8) {
        throw new TypeError("Raster scale must be finite and between 0 and 8")
      }
      const targetWidth = Math.max(1, Math.round(asset.width * scale))
      const targetHeight = Math.max(1, Math.round(asset.height * scale))
      if (targetWidth * targetHeight > context.limits.maxRasterPixels) {
        throw new EditorialRenderError("OUTPUT_TOO_LARGE", "Rasterized diagram exceeds the pixel budget", {
          width: targetWidth,
          height: targetHeight,
          maximum: context.limits.maxRasterPixels,
        })
      }

      const result = await withEditorialDeadline(
        () => backend.render(asset.svg, { scale, background: context.palette?.background ?? "#FFFFFF" }),
        context.limits.renderTimeoutMs,
        context.signal,
      )
      assertPng(result.bytes)
      if (result.width !== targetWidth || result.height !== targetHeight) {
        throw new EditorialRenderError("INVALID_SVG", "Raster backend returned unexpected dimensions", {
          expectedWidth: targetWidth,
          expectedHeight: targetHeight,
          actualWidth: result.width,
          actualHeight: result.height,
        })
      }

      return {
        kind: "raster",
        format: "png",
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        rendererId: `${asset.rendererId}+${backend.id}`,
        sourceHash: stableEditorialHash(`${asset.sourceHash}\n${backend.id}\n${scale}`),
        title: asset.title,
        description: asset.description,
        warnings: Object.freeze([...asset.warnings, `Rasterized at ${scale}x with ${backend.id}`]),
      }
    },
  }

  return Object.freeze(rasterizer)
}

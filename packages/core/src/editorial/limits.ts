export interface EditorialLimits {
  readonly maxInputCharacters: number
  readonly maxOutputBytes: number
  readonly maxSvgElements: number
  readonly maxSvgDimension: number
  readonly maxSvgArea: number
  readonly maxDiagramNodes: number
  readonly maxDiagramEdges: number
  readonly maxRasterPixels: number
  readonly maxMetadataCharacters: number
  readonly renderTimeoutMs: number
}

export const DEFAULT_EDITORIAL_LIMITS: EditorialLimits = Object.freeze({
  maxInputCharacters: 200_000,
  maxOutputBytes: 1_500_000,
  maxSvgElements: 20_000,
  maxSvgDimension: 8_192,
  maxSvgArea: 24_000_000,
  maxDiagramNodes: 500,
  maxDiagramEdges: 1_000,
  maxRasterPixels: 24_000_000,
  maxMetadataCharacters: 2_048,
  renderTimeoutMs: 5_000,
})

export type EditorialRenderErrorCode =
  | "ABORTED"
  | "INPUT_TOO_LARGE"
  | "INVALID_SVG"
  | "OUTPUT_TOO_LARGE"
  | "RENDER_TIMEOUT"
  | "UNSAFE_SVG"
  | "UNSUPPORTED_DIAGRAM"

export class EditorialRenderError extends Error {
  readonly code: EditorialRenderErrorCode
  readonly details: Readonly<Record<string, string | number | boolean>>

  constructor(
    code: EditorialRenderErrorCode,
    message: string,
    details: Readonly<Record<string, string | number | boolean>> = {},
  ) {
    super(message)
    this.name = "EditorialRenderError"
    this.code = code
    this.details = Object.freeze({ ...details })
  }
}

export function resolveEditorialLimits(overrides: Partial<EditorialLimits> = {}): EditorialLimits {
  const resolved = { ...DEFAULT_EDITORIAL_LIMITS, ...overrides }

  for (const [name, value] of Object.entries(resolved)) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new TypeError(`Editorial limit ${name} must be a positive safe integer`)
    }
  }

  return Object.freeze(resolved)
}

export function assertInputWithinLimits(input: string, limits: EditorialLimits): void {
  if (input.length > limits.maxInputCharacters) {
    throw new EditorialRenderError("INPUT_TOO_LARGE", "Editorial input exceeds the configured character limit", {
      actual: input.length,
      maximum: limits.maxInputCharacters,
    })
  }
}

export function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new EditorialRenderError("ABORTED", "Editorial rendering was cancelled")
  }
}

export async function withEditorialDeadline<T>(
  operation: () => T | Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<T> {
  assertNotAborted(signal)

  return await new Promise<T>((resolve, reject) => {
    let settled = false
    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal?.removeEventListener("abort", onAbort)
      callback()
    }
    const onAbort = () => finish(() => reject(new EditorialRenderError("ABORTED", "Editorial rendering was cancelled")))
    const timer = setTimeout(() => {
      finish(() =>
        reject(
          new EditorialRenderError("RENDER_TIMEOUT", "Editorial renderer exceeded its deadline", {
            timeoutMs,
          }),
        ),
      )
    }, timeoutMs)

    signal?.addEventListener("abort", onAbort, { once: true })

    Promise.resolve()
      .then(operation)
      .then(
        (value) => finish(() => resolve(value)),
        (error: unknown) => finish(() => reject(error)),
      )
  })
}

export function stableEditorialHash(value: string): string {
  // FNV-1a 64-bit is deterministic in every supported browser and Node runtime.
  // It is a cache key, not a cryptographic integrity primitive.
  let hash = 0xcbf29ce484222325n
  const bytes = new TextEncoder().encode(value)
  for (const byte of bytes) {
    hash ^= BigInt(byte)
    hash = BigInt.asUintN(64, hash * 0x100000001b3n)
  }
  return `fnv1a64:${hash.toString(16).padStart(16, "0")}`
}

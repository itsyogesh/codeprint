import { type ImportedSource, SOURCE_MAX_BYTES } from "@codeprint/core/source"

const KEY = "codeprint:reviewed-url-import"

export function sourceEditorAnchor(format: ImportedSource["format"]): string {
  return format === "markdown" ? "md-editor-section" : format === "csv" ? "csv-editor-section" : "editor-section"
}

// One-shot tab-local handoff after explicit review. Source text and URLs never
// go into navigation URLs and the handoff is removed as soon as it is read.
export function transferSource(source: ImportedSource): string {
  sessionStorage.setItem(KEY, JSON.stringify({ source, expires: Date.now() + 60_000 }))
  const route = source.format === "markdown" ? "/markdown" : source.format === "csv" ? "/csv" : "/"
  return `${route}#imported-file`
}

export function takeTransferredSource(format: ImportedSource["format"]): ImportedSource | null {
  if (window.location.hash !== "#imported-file") return null
  const saved = sessionStorage.getItem(KEY)
  sessionStorage.removeItem(KEY)
  if (!saved) return null
  try {
    const { source, expires } = JSON.parse(saved)
    if (
      !Number.isFinite(expires) ||
      expires < Date.now() ||
      expires > Date.now() + 60_000 ||
      source?.format !== format ||
      typeof source.content !== "string" ||
      !source.content.trim() ||
      new TextEncoder().encode(source.content).length > SOURCE_MAX_BYTES ||
      typeof source.filename !== "string" ||
      source.filename.length > 180 ||
      typeof source.language !== "string" ||
      source.language.length > 40 ||
      typeof source.sourceUrl !== "string" ||
      typeof source.sizeBytes !== "number"
    )
      return null
    return source as ImportedSource
  } catch {
    return null
  }
}

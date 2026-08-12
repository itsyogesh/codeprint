import { type EditorialLimits, EditorialRenderError } from "./limits"
import { CODEPRINT_EDITORIAL_FONTS, CODEPRINT_LIGHT_PALETTE, type EditorialPalette } from "./renderer"

const SAFE_TAG_NAMES = new Map<string, string>([
  ["svg", "svg"],
  ["g", "g"],
  ["defs", "defs"],
  ["marker", "marker"],
  ["polygon", "polygon"],
  ["polyline", "polyline"],
  ["rect", "rect"],
  ["line", "line"],
  ["path", "path"],
  ["circle", "circle"],
  ["ellipse", "ellipse"],
  ["text", "text"],
  ["tspan", "tspan"],
  ["clippath", "clipPath"],
  ["lineargradient", "linearGradient"],
  ["radialgradient", "radialGradient"],
  ["stop", "stop"],
])

const REMOVED_SUBTREES = new Set([
  "script",
  "foreignobject",
  "style",
  "image",
  "iframe",
  "object",
  "embed",
  "a",
  "title",
  "desc",
])

const SAFE_ATTRIBUTE_NAMES = new Map<string, string>([
  ["xmlns", "xmlns"],
  ["viewbox", "viewBox"],
  ["width", "width"],
  ["height", "height"],
  ["x", "x"],
  ["y", "y"],
  ["dx", "dx"],
  ["dy", "dy"],
  ["x1", "x1"],
  ["y1", "y1"],
  ["x2", "x2"],
  ["y2", "y2"],
  ["cx", "cx"],
  ["cy", "cy"],
  ["r", "r"],
  ["rx", "rx"],
  ["ry", "ry"],
  ["d", "d"],
  ["points", "points"],
  ["fill", "fill"],
  ["stroke", "stroke"],
  ["stroke-width", "stroke-width"],
  ["stroke-linecap", "stroke-linecap"],
  ["stroke-linejoin", "stroke-linejoin"],
  ["stroke-dasharray", "stroke-dasharray"],
  ["stroke-dashoffset", "stroke-dashoffset"],
  ["stroke-opacity", "stroke-opacity"],
  ["fill-opacity", "fill-opacity"],
  ["opacity", "opacity"],
  ["transform", "transform"],
  ["text-anchor", "text-anchor"],
  ["dominant-baseline", "dominant-baseline"],
  ["alignment-baseline", "alignment-baseline"],
  ["font-size", "font-size"],
  ["font-style", "font-style"],
  ["font-weight", "font-weight"],
  ["font-family", "font-family"],
  ["letter-spacing", "letter-spacing"],
  ["text-decoration", "text-decoration"],
  ["class", "class"],
  ["id", "id"],
  ["marker-start", "marker-start"],
  ["marker-mid", "marker-mid"],
  ["marker-end", "marker-end"],
  ["orient", "orient"],
  ["markerwidth", "markerWidth"],
  ["markerheight", "markerHeight"],
  ["refx", "refX"],
  ["refy", "refY"],
  ["preserveaspectratio", "preserveAspectRatio"],
  ["offset", "offset"],
  ["stop-color", "stop-color"],
  ["stop-opacity", "stop-opacity"],
  ["gradientunits", "gradientUnits"],
  ["gradienttransform", "gradientTransform"],
  ["spreadmethod", "spreadMethod"],
  ["clip-path", "clip-path"],
  ["clippathunits", "clipPathUnits"],
])

const LOCAL_REFERENCE_ATTRIBUTES = new Set(["marker-start", "marker-mid", "marker-end", "clip-path"])
const FRAGMENT_REFERENCE = /^url\(\s*#[A-Za-z_][A-Za-z0-9_.:-]*\s*\)$/
const LOCAL_HREF = /^#[A-Za-z_][A-Za-z0-9_.:-]*$/
const SAFE_ID = /^[A-Za-z_][A-Za-z0-9_.:-]*$/
const XML_ENTITY = /&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi

interface ParsedAttribute {
  name: string
  value: string
}

interface ParsedTag {
  name: string
  closing: boolean
  selfClosing: boolean
  attributes: ParsedAttribute[]
  end: number
}

export interface NormalizeSvgMetadata {
  title: string
  description?: string
}

export interface NormalizeSvgOptions {
  limits: EditorialLimits
  palette?: EditorialPalette
  fontFamily?: string
  monoFontFamily?: string
}

export interface NormalizedSvg {
  svg: string
  width: number
  height: number
  elementCount: number
  removed: readonly string[]
}

function outputByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function replaceControlCharacters(value: string): string {
  return [...value]
    .map((character) => {
      const codePoint = character.codePointAt(0) ?? 0
      return codePoint < 32 || codePoint === 127 ? " " : character
    })
    .join("")
}

function normalizedMetadata(value: string | undefined, fallback: string, maximum: number): string {
  const normalized = replaceControlCharacters(value ?? fallback)
    .replace(/\s+/g, " ")
    .trim()
  if (normalized.length === 0) return fallback
  return normalized.slice(0, maximum)
}

function findTagEnd(svg: string, start: number): number {
  let quote = ""
  for (let index = start + 1; index < svg.length; index += 1) {
    const character = svg[index] ?? ""
    if (quote) {
      if (character === quote) quote = ""
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if (character === ">") return index
  }
  return -1
}

function parseAttributes(source: string): { attributes: ParsedAttribute[]; selfClosing: boolean } {
  const attributes: ParsedAttribute[] = []
  const seen = new Set<string>()
  let index = 0
  let selfClosing = false

  while (index < source.length) {
    while (/\s/.test(source[index] ?? "")) index += 1
    if (index >= source.length) break
    if (source[index] === "/" && source.slice(index + 1).trim().length === 0) {
      selfClosing = true
      break
    }

    const nameMatch = /^[A-Za-z_:][A-Za-z0-9_.:-]*/.exec(source.slice(index))
    if (!nameMatch) {
      throw new EditorialRenderError("INVALID_SVG", "SVG contains a malformed attribute")
    }
    const name = nameMatch[0]
    index += name.length
    while (/\s/.test(source[index] ?? "")) index += 1
    if (source[index] !== "=") {
      throw new EditorialRenderError("INVALID_SVG", "SVG attributes must use quoted values")
    }
    index += 1
    while (/\s/.test(source[index] ?? "")) index += 1
    const quote = source[index]
    if (quote !== '"' && quote !== "'") {
      throw new EditorialRenderError("INVALID_SVG", "SVG attributes must use quoted values")
    }
    index += 1
    const valueStart = index
    while (index < source.length && source[index] !== quote) index += 1
    if (index >= source.length) {
      throw new EditorialRenderError("INVALID_SVG", "SVG contains an unterminated attribute")
    }
    const value = source.slice(valueStart, index)
    index += 1

    const normalizedName = name.toLowerCase()
    if (seen.has(normalizedName)) {
      throw new EditorialRenderError("INVALID_SVG", "SVG contains a duplicate attribute", { attribute: name })
    }
    seen.add(normalizedName)
    attributes.push({ name, value })
  }

  return { attributes, selfClosing }
}

function parseTag(svg: string, start: number): ParsedTag {
  const end = findTagEnd(svg, start)
  if (end < 0) throw new EditorialRenderError("INVALID_SVG", "SVG contains an unterminated tag")
  const raw = svg.slice(start + 1, end)
  const closing = raw.trimStart().startsWith("/")
  const body = closing ? raw.trimStart().slice(1).trim() : raw.trim()
  const nameMatch = /^[A-Za-z][A-Za-z0-9:-]*/.exec(body)
  if (!nameMatch) throw new EditorialRenderError("INVALID_SVG", "SVG contains a malformed tag")
  const name = nameMatch[0]
  const remainder = body.slice(name.length)

  if (closing) {
    if (remainder.trim().length > 0) {
      throw new EditorialRenderError("INVALID_SVG", "SVG closing tags cannot have attributes")
    }
    return { name, closing, selfClosing: false, attributes: [], end }
  }

  const parsed = parseAttributes(remainder)
  return { name, closing, selfClosing: parsed.selfClosing, attributes: parsed.attributes, end }
}

function assertEntitySafe(value: string): void {
  const withoutEntities = value.replace(XML_ENTITY, "")
  if (
    withoutEntities.includes("&") ||
    value.includes("<") ||
    value.includes(">") ||
    value.includes(String.fromCharCode(0))
  ) {
    throw new EditorialRenderError("INVALID_SVG", "SVG contains invalid XML text")
  }
}

function paletteValues(palette: EditorialPalette): Readonly<Record<string, string>> {
  return Object.freeze({
    "--bg": palette.background,
    "--fg": palette.foreground,
    "--line": palette.line,
    "--accent": palette.accent,
    "--muted": palette.mutedText,
    "--surface": palette.surface,
    "--border": palette.border,
    "--_text": palette.foreground,
    "--_text-sec": palette.secondaryText,
    "--_text-muted": palette.mutedText,
    "--_text-faint": palette.faintText,
    "--_line": palette.line,
    "--_arrow": palette.accent,
    "--_node-fill": palette.surface,
    "--_node-stroke": palette.border,
    "--_group-fill": palette.background,
    "--_group-hdr": palette.groupHeader,
    "--_inner-stroke": palette.border,
    "--_key-badge": palette.keyBadge,
  })
}

function resolvePaletteValue(value: string, palette: EditorialPalette): string {
  const values = paletteValues(palette)
  const resolved = value.replace(/var\(\s*(--[A-Za-z0-9_-]+)\s*\)/g, (_match, variable: string) => {
    const replacement = values[variable]
    if (!replacement) {
      throw new EditorialRenderError("UNSAFE_SVG", "SVG references a color outside the Codeprint palette", {
        variable,
      })
    }
    return replacement
  })
  if (/\b(?:var|color-mix)\s*\(/i.test(resolved)) {
    throw new EditorialRenderError("UNSAFE_SVG", "SVG contains an unresolved dynamic color")
  }
  return resolved
}

function sanitizeAttribute(
  attribute: ParsedAttribute,
  palette: EditorialPalette,
  fontFamily: string,
  removed: Set<string>,
): ParsedAttribute | null {
  const lowerName = attribute.name.toLowerCase()
  if (lowerName === "style" || lowerName.startsWith("on")) {
    removed.add(lowerName === "style" ? "inline styles" : "event handlers")
    return null
  }
  if (lowerName === "href" || lowerName === "xlink:href") {
    if (!LOCAL_HREF.test(attribute.value)) {
      removed.add("external hrefs")
      return null
    }
    return { name: "href", value: attribute.value }
  }
  if (lowerName.startsWith("xmlns:")) {
    removed.add("external namespaces")
    return null
  }

  const canonicalName = SAFE_ATTRIBUTE_NAMES.get(lowerName)
  if (!canonicalName && !lowerName.startsWith("data-")) {
    removed.add(`attribute:${lowerName}`)
    return null
  }
  assertEntitySafe(attribute.value)
  let value = resolvePaletteValue(attribute.value, palette)

  if (canonicalName === "id" && !SAFE_ID.test(value)) {
    throw new EditorialRenderError("UNSAFE_SVG", "SVG contains an unsafe identifier")
  }
  if (canonicalName && LOCAL_REFERENCE_ATTRIBUTES.has(canonicalName) && !FRAGMENT_REFERENCE.test(value)) {
    removed.add("external paint references")
    return null
  }
  if (/url\s*\(/i.test(value) && !(canonicalName && LOCAL_REFERENCE_ATTRIBUTES.has(canonicalName))) {
    removed.add("external paint references")
    if (canonicalName === "fill") return { name: canonicalName, value: palette.surface }
    if (canonicalName === "stroke") return { name: canonicalName, value: palette.line }
    return null
  }
  if (canonicalName === "xmlns" && value === "http://www.w3.org/2000/svg") {
    return { name: canonicalName, value }
  }
  if (/\b(?:javascript|data|https?|file|ftp)\s*:/i.test(value) || /@import|expression\s*\(/i.test(value)) {
    removed.add("active or network values")
    if (canonicalName === "fill") return { name: canonicalName, value: palette.surface }
    if (canonicalName === "stroke") return { name: canonicalName, value: palette.line }
    return null
  }
  if (canonicalName === "font-family") value = fontFamily

  return { name: canonicalName ?? lowerName, value }
}

function numericDimension(value: string | undefined): number | null {
  if (!value) return null
  const match = /^([0-9]+(?:\.[0-9]+)?)(?:px)?$/.exec(value.trim())
  if (!match) return null
  const result = Number(match[1])
  return Number.isFinite(result) && result > 0 ? result : null
}

function dimensionsFromRoot(attributes: readonly ParsedAttribute[]): { width: number; height: number } {
  const values = new Map(attributes.map((attribute) => [attribute.name.toLowerCase(), attribute.value]))
  let width = numericDimension(values.get("width"))
  let height = numericDimension(values.get("height"))
  const viewBox = values.get("viewbox")
  if ((!width || !height) && viewBox) {
    const parts = viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number)
    if (parts.length === 4 && parts.every(Number.isFinite) && parts[2]! > 0 && parts[3]! > 0) {
      width ??= parts[2]!
      height ??= parts[3]!
    }
  }
  if (!width || !height) {
    throw new EditorialRenderError("INVALID_SVG", "SVG must have finite positive dimensions or a valid viewBox")
  }
  return { width, height }
}

function serializeAttributes(attributes: readonly ParsedAttribute[]): string {
  if (attributes.length === 0) return ""
  return ` ${attributes.map(({ name, value }) => `${name}="${value}"`).join(" ")}`
}

export function normalizeEditorialSvg(
  input: string,
  metadata: NormalizeSvgMetadata,
  options: NormalizeSvgOptions,
): NormalizedSvg {
  const { limits } = options
  const palette = options.palette ?? CODEPRINT_LIGHT_PALETTE
  const fontFamily = options.fontFamily ?? CODEPRINT_EDITORIAL_FONTS.body
  const monoFontFamily = options.monoFontFamily ?? CODEPRINT_EDITORIAL_FONTS.mono
  const rawBytes = outputByteLength(input)
  if (rawBytes > limits.maxOutputBytes) {
    throw new EditorialRenderError("OUTPUT_TOO_LARGE", "SVG output exceeds the configured byte limit", {
      actual: rawBytes,
      maximum: limits.maxOutputBytes,
    })
  }
  if (/<!DOCTYPE|<!ENTITY|<!\[CDATA\[|<\?/i.test(input)) {
    throw new EditorialRenderError("UNSAFE_SVG", "SVG contains a prohibited XML declaration")
  }

  const title = normalizedMetadata(metadata.title, "Diagram", limits.maxMetadataCharacters)
  const description = normalizedMetadata(metadata.description, "Printable diagram", limits.maxMetadataCharacters)
  const output: string[] = []
  const safeStack: string[] = []
  const removedStack: string[] = []
  const removed = new Set<string>()
  let cursor = 0
  let rootSeen = false
  let rootClosed = false
  let elementCount = 0
  let dimensions: { width: number; height: number } | undefined

  while (cursor < input.length) {
    const tagStart = input.indexOf("<", cursor)
    const textEnd = tagStart < 0 ? input.length : tagStart
    const text = input.slice(cursor, textEnd)
    if (removedStack.length === 0) {
      if ((!rootSeen || rootClosed) && text.trim().length > 0) {
        throw new EditorialRenderError("INVALID_SVG", "SVG has content outside its root element")
      }
      assertEntitySafe(text)
      output.push(text)
    }
    if (tagStart < 0) break

    if (input.startsWith("<!--", tagStart)) {
      const commentEnd = input.indexOf("-->", tagStart + 4)
      if (commentEnd < 0) throw new EditorialRenderError("INVALID_SVG", "SVG contains an unterminated comment")
      removed.add("comments")
      cursor = commentEnd + 3
      continue
    }

    const tag = parseTag(input, tagStart)
    cursor = tag.end + 1
    const lowerName = tag.name.toLowerCase()

    if (removedStack.length > 0) {
      if (tag.closing) {
        const expected = removedStack.at(-1)
        if (expected !== lowerName) {
          throw new EditorialRenderError("INVALID_SVG", "SVG contains mismatched tags in removed content")
        }
        removedStack.pop()
      } else if (!tag.selfClosing) {
        removedStack.push(lowerName)
      }
      continue
    }

    if (REMOVED_SUBTREES.has(lowerName)) {
      removed.add(lowerName === "style" ? "network styles and dynamic CSS" : lowerName)
      if (!tag.closing && !tag.selfClosing) removedStack.push(lowerName)
      if (tag.closing) {
        throw new EditorialRenderError("INVALID_SVG", "SVG contains an unmatched removed closing tag")
      }
      continue
    }

    const safeName = SAFE_TAG_NAMES.get(lowerName)
    if (!safeName) {
      throw new EditorialRenderError("UNSAFE_SVG", "SVG contains an element outside the print-safe subset", {
        element: tag.name,
      })
    }

    if (tag.closing) {
      const expected = safeStack.at(-1)
      if (expected !== safeName) {
        throw new EditorialRenderError("INVALID_SVG", "SVG contains mismatched closing tags")
      }
      safeStack.pop()
      output.push(`</${safeName}>`)
      if (safeName === "svg") rootClosed = true
      continue
    }

    if (!rootSeen && safeName !== "svg") {
      throw new EditorialRenderError("INVALID_SVG", "SVG root element is missing")
    }
    if (safeName === "svg") {
      if (rootSeen || safeStack.length > 0) {
        throw new EditorialRenderError("INVALID_SVG", "SVG cannot contain nested or repeated roots")
      }
      rootSeen = true
    } else if (safeStack.length === 0) {
      throw new EditorialRenderError("INVALID_SVG", "SVG element occurs outside its root")
    }

    elementCount += 1
    if (elementCount > limits.maxSvgElements) {
      throw new EditorialRenderError("OUTPUT_TOO_LARGE", "SVG exceeds the configured element limit", {
        actual: elementCount,
        maximum: limits.maxSvgElements,
      })
    }

    let attributes = tag.attributes
      .map((attribute) => sanitizeAttribute(attribute, palette, fontFamily, removed))
      .filter((attribute): attribute is ParsedAttribute => attribute !== null)
    if (
      attributes
        .find((attribute) => attribute.name === "class")
        ?.value.split(/\s+/)
        .includes("mono")
    ) {
      attributes = attributes.filter((attribute) => attribute.name !== "font-family")
      attributes.push({ name: "font-family", value: escapeXml(monoFontFamily) })
    }

    if (safeName === "svg") {
      dimensions = dimensionsFromRoot(attributes)
      if (
        dimensions.width > limits.maxSvgDimension ||
        dimensions.height > limits.maxSvgDimension ||
        dimensions.width * dimensions.height > limits.maxSvgArea
      ) {
        throw new EditorialRenderError("OUTPUT_TOO_LARGE", "SVG dimensions exceed the configured print limits", {
          width: dimensions.width,
          height: dimensions.height,
        })
      }
      attributes = attributes.filter(
        (attribute) =>
          !["xmlns", "role", "aria-label", "aria-labelledby", "focusable", "font-family"].includes(attribute.name),
      )
      attributes.unshift(
        { name: "xmlns", value: "http://www.w3.org/2000/svg" },
        { name: "role", value: "img" },
        { name: "aria-label", value: escapeXml(title) },
        { name: "focusable", value: "false" },
        { name: "font-family", value: escapeXml(fontFamily) },
      )
    }

    output.push(`<${safeName}${serializeAttributes(attributes)}${tag.selfClosing ? "/" : ""}>`)
    if (safeName === "svg") {
      output.push(`<title>${escapeXml(title)}</title><desc>${escapeXml(description)}</desc>`)
    }
    if (!tag.selfClosing) safeStack.push(safeName)
    if (tag.selfClosing && safeName === "svg") rootClosed = true
  }

  if (!rootSeen || !rootClosed || safeStack.length > 0 || removedStack.length > 0 || !dimensions) {
    throw new EditorialRenderError("INVALID_SVG", "SVG is incomplete or has unbalanced elements")
  }

  const svg = output.join("").trim()
  if (/\b(?:var|color-mix)\s*\(|<\/?(?:script|style|foreignObject)\b|@import/i.test(svg)) {
    throw new EditorialRenderError("UNSAFE_SVG", "SVG normalization left an unsafe construct")
  }
  const normalizedBytes = outputByteLength(svg)
  if (normalizedBytes > limits.maxOutputBytes) {
    throw new EditorialRenderError("OUTPUT_TOO_LARGE", "Normalized SVG exceeds the configured byte limit", {
      actual: normalizedBytes,
      maximum: limits.maxOutputBytes,
    })
  }

  return {
    svg,
    width: dimensions.width,
    height: dimensions.height,
    elementCount,
    removed: Object.freeze([...removed].sort()),
  }
}

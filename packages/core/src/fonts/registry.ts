import { Font } from "@react-pdf/renderer"

export type CodeprintFontStyle = "normal" | "italic"
export type CodeprintFontWeight = 400 | 700

export interface LocalFontFace {
  src: string
  fontStyle: CodeprintFontStyle
  fontWeight: CodeprintFontWeight
}

export interface LocalFontFamily {
  family: string
  license: "OFL-1.1"
  faces: readonly LocalFontFace[]
}

export function ensureLocalFontFamilyRegistered(definition: LocalFontFamily): void {
  if (Font.getRegisteredFontFamilies().includes(definition.family)) return

  Font.register({
    family: definition.family,
    fonts: definition.faces.map((face) => ({
      src: face.src,
      fontStyle: face.fontStyle,
      fontWeight: face.fontWeight,
    })),
  })
}

function glyphSetHash(text: string): string {
  const glyphs = [...new Set(Array.from(text, (character) => character.codePointAt(0) ?? 0))].sort(
    (left, right) => left - right,
  )
  let hash = 0x811c9dc5
  for (const codePoint of glyphs) {
    hash ^= codePoint
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, "0")
}

/**
 * React PDF keeps a loaded font object globally. Reusing that object after it
 * has emitted one subset can omit glyphs that only appear in a later PDF.
 * A stable family alias per glyph repertoire gives each distinct subset a
 * fresh font object while still reusing aliases as an editor document changes.
 */
export function registerLocalFontFamilyForText(definition: LocalFontFamily, text: string): string {
  const family = `${definition.family} ${glyphSetHash(text)}`
  if (Font.getRegisteredFontFamilies().includes(family)) return family

  Font.register({
    family,
    fonts: definition.faces.map((face) => ({
      src: face.src,
      fontStyle: face.fontStyle,
      fontWeight: face.fontWeight,
    })),
  })
  return family
}

import merriweatherBold from "../../assets/fonts/merriweather/Merriweather-Bold.ttf"
import merriweatherItalic from "../../assets/fonts/merriweather/Merriweather-Italic.ttf"
import merriweatherRegular from "../../assets/fonts/merriweather/Merriweather-Regular.ttf"
import { ensureLocalFontFamilyRegistered, type LocalFontFamily } from "./registry"

export const MERRIWEATHER_FONT_FAMILY = "Merriweather"

export const MERRIWEATHER_LOCAL_FONT: LocalFontFamily = Object.freeze({
  family: MERRIWEATHER_FONT_FAMILY,
  license: "OFL-1.1",
  faces: Object.freeze([
    { src: merriweatherRegular, fontStyle: "normal" as const, fontWeight: 400 as const },
    { src: merriweatherBold, fontStyle: "normal" as const, fontWeight: 700 as const },
    { src: merriweatherItalic, fontStyle: "italic" as const, fontWeight: 400 as const },
  ]),
})

export function ensureMerriweatherRegistered(): void {
  ensureLocalFontFamilyRegistered(MERRIWEATHER_LOCAL_FONT)
}

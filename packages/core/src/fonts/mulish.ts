import mulishBold from "../../assets/fonts/mulish/Mulish-Bold.ttf"
import mulishItalic from "../../assets/fonts/mulish/Mulish-Italic.ttf"
import mulishRegular from "../../assets/fonts/mulish/Mulish-Regular.ttf"
import { ensureLocalFontFamilyRegistered, type LocalFontFamily } from "./registry"

export const MULISH_FONT_FAMILY = "Mulish"

export const MULISH_LOCAL_FONT: LocalFontFamily = Object.freeze({
  family: MULISH_FONT_FAMILY,
  license: "OFL-1.1",
  faces: Object.freeze([
    { src: mulishRegular, fontStyle: "normal" as const, fontWeight: 400 as const },
    { src: mulishBold, fontStyle: "normal" as const, fontWeight: 700 as const },
    { src: mulishItalic, fontStyle: "italic" as const, fontWeight: 400 as const },
  ]),
})

export function ensureMulishRegistered(): void {
  ensureLocalFontFamilyRegistered(MULISH_LOCAL_FONT)
}

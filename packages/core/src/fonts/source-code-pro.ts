import sourceCodeProBold from "../../assets/fonts/source-code-pro/SourceCodePro-Bold.ttf"
import sourceCodeProItalic from "../../assets/fonts/source-code-pro/SourceCodePro-Italic.ttf"
import sourceCodeProRegular from "../../assets/fonts/source-code-pro/SourceCodePro-Regular.ttf"
import { ensureLocalFontFamilyRegistered, type LocalFontFamily } from "./registry"

export const SOURCE_CODE_PRO_FONT_FAMILY = "Source Code Pro"

export const SOURCE_CODE_PRO_LOCAL_FONT: LocalFontFamily = Object.freeze({
  family: SOURCE_CODE_PRO_FONT_FAMILY,
  license: "OFL-1.1",
  faces: Object.freeze([
    { src: sourceCodeProRegular, fontStyle: "normal" as const, fontWeight: 400 as const },
    { src: sourceCodeProBold, fontStyle: "normal" as const, fontWeight: 700 as const },
    { src: sourceCodeProItalic, fontStyle: "italic" as const, fontWeight: 400 as const },
  ]),
})

export function ensureSourceCodeProRegistered(): void {
  ensureLocalFontFamilyRegistered(SOURCE_CODE_PRO_LOCAL_FONT)
}

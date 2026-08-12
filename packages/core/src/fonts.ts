import { ensureMerriweatherRegistered } from "./fonts/merriweather"
import { ensureMulishRegistered } from "./fonts/mulish"
import { ensureSourceCodeProRegistered } from "./fonts/source-code-pro"

export {
  ensureMerriweatherRegistered,
  MERRIWEATHER_FONT_FAMILY,
  MERRIWEATHER_LOCAL_FONT,
} from "./fonts/merriweather"
export { ensureMulishRegistered, MULISH_FONT_FAMILY, MULISH_LOCAL_FONT } from "./fonts/mulish"
export type { CodeprintFontStyle, CodeprintFontWeight, LocalFontFace, LocalFontFamily } from "./fonts/registry"
export { registerLocalFontFamilyForText } from "./fonts/registry"
export {
  ensureSourceCodeProRegistered,
  SOURCE_CODE_PRO_FONT_FAMILY,
  SOURCE_CODE_PRO_LOCAL_FONT,
} from "./fonts/source-code-pro"

export const CODEPRINT_LOCAL_FONT_IDS = ["mulish", "merriweather", "source-code-pro"] as const
export type CodeprintLocalFontId = (typeof CODEPRINT_LOCAL_FONT_IDS)[number]

export function registerCodeprintFonts(fonts: readonly CodeprintLocalFontId[] = CODEPRINT_LOCAL_FONT_IDS): void {
  for (const font of fonts) {
    if (font === "mulish") ensureMulishRegistered()
    else if (font === "merriweather") ensureMerriweatherRegistered()
    else ensureSourceCodeProRegistered()
  }
}

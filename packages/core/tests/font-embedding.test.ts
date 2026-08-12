import { spawnSync } from "node:child_process"
import { Font } from "@react-pdf/renderer"
import { describe, expect, it } from "vitest"
import {
  MERRIWEATHER_FONT_FAMILY,
  MERRIWEATHER_LOCAL_FONT,
  MULISH_FONT_FAMILY,
  MULISH_LOCAL_FONT,
  registerCodeprintFonts,
  SOURCE_CODE_PRO_FONT_FAMILY,
  SOURCE_CODE_PRO_LOCAL_FONT,
} from "../src/fonts"
import { renderPrintablePdf } from "../src/render"

const hasPdfText = !spawnSync("pdftotext", ["-v"], { encoding: "utf8" }).error
const hasPdfFonts = !spawnSync("pdffonts", ["-v"], { encoding: "utf8" }).error

function extractPdfText(bytes: Uint8Array): string {
  const extracted = spawnSync("pdftotext", ["-layout", "-", "-"], {
    input: Buffer.from(bytes),
    encoding: "utf8",
  })
  if (extracted.error) throw extracted.error
  if (extracted.status !== 0) throw new Error(extracted.stderr || "pdftotext failed")
  return extracted.stdout
}

function inspectPdfFonts(bytes: Uint8Array): string {
  const inspected = spawnSync("pdffonts", ["-"], {
    input: Buffer.from(bytes),
    encoding: "utf8",
  })
  if (inspected.error) throw inspected.error
  if (inspected.status !== 0) throw new Error(inspected.stderr || "pdffonts failed")
  return inspected.stdout
}

describe("local Codeprint font registry", () => {
  it("registers local regular, bold, and italic faces without network URLs", () => {
    registerCodeprintFonts()

    const registered = Font.getRegisteredFonts()
    for (const definition of [MULISH_LOCAL_FONT, MERRIWEATHER_LOCAL_FONT, SOURCE_CODE_PRO_LOCAL_FONT]) {
      expect(registered[definition.family]).toBeDefined()
      expect(definition.faces.map(({ fontStyle, fontWeight }) => ({ fontStyle, fontWeight }))).toEqual([
        { fontStyle: "normal", fontWeight: 400 },
        { fontStyle: "normal", fontWeight: 700 },
        { fontStyle: "italic", fontWeight: 400 },
      ])
      expect(definition.faces.every((face) => face.src.startsWith("data:font/ttf;base64,"))).toBe(true)
      expect(definition.faces.every((face) => !/^https?:/i.test(face.src))).toBe(true)
    }

    expect(Font.getRegisteredFontFamilies()).toEqual(
      expect.arrayContaining([MULISH_FONT_FAMILY, MERRIWEATHER_FONT_FAMILY, SOURCE_CODE_PRO_FONT_FAMILY]),
    )
  })
})

describe.skipIf(!hasPdfText)("Unicode PDF text extraction", () => {
  it("does not reuse a previous document's incomplete font subset", async () => {
    await renderPrintablePdf({
      format: "code",
      filename: "first.ts",
      language: "typescript",
      content: "const x = 1",
    })
    const secondContent = 'const приветствие = "café résumé"'
    const second = await renderPrintablePdf({
      format: "code",
      filename: "second.ts",
      language: "typescript",
      content: secondContent,
    })

    expect(extractPdfText(second.bytes)).toContain(secondContent)
  })

  it("preserves Latin and Cyrillic Markdown through the editorial font set", async () => {
    const result = await renderPrintablePdf({
      format: "markdown",
      filename: "unicode.md",
      content: [
        "# Привет, редакция",
        "",
        "A café résumé with **жирный текст** and _курсив_.",
        "",
        "```typescript",
        'const приветствие = "Привет, мир"',
        "```",
      ].join("\n"),
    })

    const text = extractPdfText(result.bytes)
    expect(text).toContain("Привет, редакция")
    expect(text).toContain("A café résumé with жирный текст and курсив.")
    expect(text).toContain('const приветствие = "Привет, мир"')
    expect(text).not.toContain("�")
  })

  it("preserves Latin and Cyrillic source code through Source Code Pro", async () => {
    const content = 'const приветствие = "Привет, мир"; // café naïve résumé'
    const result = await renderPrintablePdf({
      format: "code",
      filename: "unicode.ts",
      language: "typescript",
      content,
    })

    const text = extractPdfText(result.bytes)
    expect(text).toContain(content)
    expect(text).not.toContain("�")
  })

  it("preserves Latin and Cyrillic table content through Mulish", async () => {
    const content = "Название,Описание\nПример,Привет café naïve résumé"
    const result = await renderPrintablePdf({
      format: "csv",
      filename: "unicode.csv",
      content,
      hasHeaderRow: true,
    })

    const text = extractPdfText(result.bytes)
    expect(text).toContain("Название")
    expect(text).toContain("Описание")
    expect(text).toContain("Пример")
    expect(text).toContain("Привет café naïve résumé")
    expect(text).not.toContain("�")
  })
})

describe.skipIf(!hasPdfFonts)("embedded PDF font metadata", () => {
  it("embeds the complete Markdown editorial font set with Unicode maps", async () => {
    const result = await renderPrintablePdf({
      format: "markdown",
      filename: "embedded.md",
      content:
        "# Заголовок\n\nПривет **café** across a soft\nsource line break.\n\n```typescript\nconst ответ = 42\n```",
      tableOfContents: true,
    })

    const fonts = inspectPdfFonts(result.bytes)
    expect(fonts).toMatch(/Merriweather-Bold\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes/i)
    expect(fonts).toMatch(/Mulish-Regular\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes/i)
    expect(fonts).toMatch(/Mulish-Bold\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes/i)
    expect(fonts).toMatch(/SourceCodePro-Regular\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes/i)
    expect(fonts).not.toMatch(/Helvetica|\sno\s+no\s+no\s+/i)
  })

  it("embeds subset Source Code Pro fonts with Unicode maps", async () => {
    const result = await renderPrintablePdf({
      format: "code",
      filename: "embedded.ts",
      language: "typescript",
      content: 'const сообщение = "Привет café"',
    })

    const fonts = inspectPdfFonts(result.bytes)
    expect(fonts).toMatch(/SourceCodePro-Regular\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes/i)
    expect(fonts).toMatch(/SourceCodePro-Bold\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes/i)
  })

  it("embeds subset Mulish fonts with Unicode maps", async () => {
    const result = await renderPrintablePdf({
      format: "csv",
      filename: "embedded.csv",
      content: "Название,Описание\nПример,Привет café",
      hasHeaderRow: true,
    })

    const fonts = inspectPdfFonts(result.bytes)
    expect(fonts).toMatch(/Mulish-Regular\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes/i)
    expect(fonts).toMatch(/Mulish-Bold\s+CID TrueType\s+Identity-H\s+yes\s+yes\s+yes/i)
  })
})

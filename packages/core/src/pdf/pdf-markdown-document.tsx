"use client"

import { Document, Image, Link, Page, Text, View } from "@react-pdf/renderer"
import hljs from "highlight.js"
import { marked, type Token, type Tokens } from "marked"
import {
  type LocalFontFamily,
  MERRIWEATHER_LOCAL_FONT,
  MULISH_LOCAL_FONT,
  registerLocalFontFamilyForText,
  SOURCE_CODE_PRO_LOCAL_FONT,
} from "../fonts"
import {
  findPreparedMarkdownDiagram,
  isMarkdownMermaidFence,
  markdownMermaidFenceFromToken,
  type PreparedMarkdownDiagramImage,
  type PreparedMarkdownDiagrams,
} from "../markdown-diagrams"
import type { MarkdownSettings } from "../types"
import { HLJS_COLORS, MARKDOWN_LEADING, markdownStyles, PAGE_POINT_SIZES, PAGE_SIZE_MAP } from "./pdf-styles"

export interface PdfMarkdownDocumentProps {
  content: string
  filename: string
  settings: MarkdownSettings
  preparedDiagrams?: PreparedMarkdownDiagrams
}

interface RenderContext {
  settings: MarkdownSettings
  bodyFont: string
  headingFont: string
  codeFont: string
  headingIds: Map<Token, string>
  preparedDiagrams?: PreparedMarkdownDiagrams
}

interface CodeSegment {
  text: string
  color?: string
}

interface MarkdownPageSection {
  key: string
  tokens: Token[]
  longTable?: Tokens.Table
  showToc?: boolean
}

const LONG_TABLE_ROW_THRESHOLD = 8

const MARGIN_POINTS: Record<MarkdownSettings["margins"], number> = {
  small: 28,
  normal: 40,
  wide: 56,
}

const FONT_MAP: Record<string, LocalFontFamily> = {
  "System Default": MULISH_LOCAL_FONT,
  Arial: MULISH_LOCAL_FONT,
  "Helvetica Neue": MULISH_LOCAL_FONT,
  Georgia: MERRIWEATHER_LOCAL_FONT,
  "Times New Roman": MERRIWEATHER_LOCAL_FONT,
  Merriweather: MERRIWEATHER_LOCAL_FONT,
  Mulish: MULISH_LOCAL_FONT,
  monospace: SOURCE_CODE_PRO_LOCAL_FONT,
  "Source Code Pro": SOURCE_CODE_PRO_LOCAL_FONT,
}

const DARK_HLJS_COLORS: Record<string, string> = {
  "hljs-keyword": "#ff7b72",
  "hljs-built_in": "#d2a8ff",
  "hljs-type": "#d2a8ff",
  "hljs-literal": "#79c0ff",
  "hljs-number": "#79c0ff",
  "hljs-string": "#a5d6ff",
  "hljs-comment": "#8b949e",
  "hljs-doctag": "#ff7b72",
  "hljs-meta": "#8b949e",
  "hljs-tag": "#7ee787",
  "hljs-attr": "#d2a8ff",
  "hljs-attribute": "#79c0ff",
  "hljs-name": "#7ee787",
  "hljs-selector-tag": "#7ee787",
  "hljs-selector-class": "#d2a8ff",
  "hljs-selector-id": "#79c0ff",
  "hljs-variable": "#ffa657",
  "hljs-template-variable": "#ffa657",
  "hljs-params": "#c9d1d9",
  "hljs-title": "#d2a8ff",
  "hljs-function": "#d2a8ff",
  "hljs-class": "#d2a8ff",
  "hljs-symbol": "#ffa657",
  "hljs-link": "#a5d6ff",
  "hljs-regexp": "#a5d6ff",
  "hljs-punctuation": "#c9d1d9",
  "hljs-subst": "#c9d1d9",
}

function fontFamily(name: string, fallback: LocalFontFamily, text: string) {
  return registerLocalFontFamilyForText(FONT_MAP[name] ?? fallback, text)
}

const disableHyphenation = (word: string) => [word]

/** Built-in PDF fonts do not contain arrows or emoji. Keep their meaning without emitting corrupt glyphs. */
function pdfSafeText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\u2194|\u21c4|\u21c6/g, "<->")
    .replace(/\u2192|\u21d2/g, "->")
    .replace(/\u2190|\u21d0/g, "<-")
    .replace(/\u2264/g, "<=")
    .replace(/\u2265/g, ">=")
    .replace(/\u2026/g, "...")
    .replace(/[\uFE0E\uFE0F]/g, "")
}

function pdfSafeInlineText(text: string) {
  return pdfSafeText(text).replace(/\r?\n/g, " ")
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function inlinePlainText(tokens: Token[]): string {
  return tokens
    .map((token) => {
      if ("tokens" in token && Array.isArray(token.tokens) && token.tokens.length) return inlinePlainText(token.tokens)
      if ("text" in token && typeof token.text === "string") return pdfSafeText(token.text)
      return ""
    })
    .join("")
}

function createHeadingIds(tokens: Token[]) {
  const ids = new Map<Token, string>()
  const counts = new Map<string, number>()

  for (const token of tokens) {
    if (token.type !== "heading") continue
    const heading = token as Tokens.Heading
    const base = slugify(inlinePlainText(heading.tokens)) || "section"
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    ids.set(token, count === 0 ? base : `${base}-${count}`)
  }

  return ids
}

function tokenPlainText(token: Token): string {
  if ("tokens" in token && Array.isArray(token.tokens)) return inlinePlainText(token.tokens)
  if ("text" in token && typeof token.text === "string") return pdfSafeText(token.text)
  return ""
}

function isShortListItem(item: Tokens.ListItem) {
  const hasNestedList = item.tokens.some((token) => token.type === "list")
  return !hasNestedList && item.tokens.reduce((length, token) => length + tokenPlainText(token).length, 0) <= 180
}

function createPageSections(tokens: Token[], showToc: boolean): MarkdownPageSection[] {
  const sections: MarkdownPageSection[] = []
  let pending: Token[] = []

  const flushPending = () => {
    if (!pending.length && !(showToc && sections.length === 0)) return
    sections.push({ key: `content-${sections.length}`, tokens: pending, showToc: showToc && sections.length === 0 })
    pending = []
  }

  for (const token of tokens) {
    if (token.type === "table" && (token as Tokens.Table).rows.length > LONG_TABLE_ROW_THRESHOLD) {
      flushPending()
      sections.push({ key: `table-${sections.length}`, tokens: [], longTable: token as Tokens.Table })
    } else {
      pending.push(token)
    }
  }

  flushPending()
  if (!sections.length) sections.push({ key: "content-0", tokens: [], showToc })
  return sections
}

function splitCodeSegments(segments: CodeSegment[], maximumCharacters: number): CodeSegment[][] {
  if (!segments.length) return [[]]

  const lines: CodeSegment[][] = [[]]
  let charactersInLine = 0

  for (const segment of segments) {
    let remaining = segment.text
    while (remaining.length) {
      if (charactersInLine >= maximumCharacters) {
        lines.push([])
        charactersInLine = 0
      }

      const charactersAvailable = maximumCharacters - charactersInLine
      const piece = remaining.slice(0, charactersAvailable)
      lines[lines.length - 1].push({ text: piece, color: segment.color })
      charactersInLine += piece.length
      remaining = remaining.slice(piece.length)
    }
  }

  return lines
}

function markdownCodeCharactersPerLine(context: RenderContext) {
  const rawPageSize = PAGE_POINT_SIZES[context.settings.pageSize]
  const pageWidth = context.settings.orientation === "portrait" ? rawPageSize.width : rawPageSize.height
  const contentWidth = pageWidth - MARGIN_POINTS[context.settings.margins] * 2 - 20
  const fontSize = Math.max(7, context.settings.fontSize * 0.68)
  return Math.max(20, Math.floor(contentWidth / (fontSize * 0.65)))
}

function markdownBodyTextStyle(context: RenderContext) {
  return {
    fontFamily: context.bodyFont,
    fontSize: context.settings.fontSize * 0.75,
  }
}

function markdownDiagramSize(asset: PreparedMarkdownDiagramImage, context: RenderContext) {
  const rawPageSize = PAGE_POINT_SIZES[context.settings.pageSize]
  const pageWidth = context.settings.orientation === "portrait" ? rawPageSize.width : rawPageSize.height
  const pageHeight = context.settings.orientation === "portrait" ? rawPageSize.height : rawPageSize.width
  const margin = MARGIN_POINTS[context.settings.margins]
  const maximumWidth = pageWidth - margin * 2 - 24
  const maximumHeight = pageHeight - margin * 2 - (context.settings.showHeader ? 108 : 82)
  const intrinsicWidth = asset.pixelWidth * (72 / 300)
  const intrinsicHeight = asset.pixelHeight * (72 / 300)
  const scale = Math.min(1, maximumWidth / intrinsicWidth, maximumHeight / intrinsicHeight)

  return {
    width: Math.max(1, intrinsicWidth * scale),
    height: Math.max(1, intrinsicHeight * scale),
  }
}

function decodeHtml(text: string) {
  return pdfSafeText(
    text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#(?:0*39|x0*27);/gi, "'")
      .replace(/&#x([0-9a-f]+);/gi, (_, value: string) => String.fromCodePoint(Number.parseInt(value, 16)))
      .replace(/&#(\d+);/g, (_, value: string) => String.fromCodePoint(Number.parseInt(value, 10))),
  )
}

function parseHighlightedCode(code: string, language: string, dark: boolean): CodeSegment[][] {
  const aliases: Record<string, string> = { shell: "bash", html: "xml", ts: "typescript", js: "javascript" }
  const languageName = language.trim().split(/\s+/, 1)[0].toLowerCase()
  const resolvedLanguage = aliases[languageName] ?? languageName

  if (!resolvedLanguage || !hljs.getLanguage(resolvedLanguage)) {
    return code.split("\n").map((line) => [{ text: pdfSafeText(line) }])
  }

  try {
    const html = hljs.highlight(code, { language: resolvedLanguage, ignoreIllegals: true }).value
    const palette = dark ? DARK_HLJS_COLORS : HLJS_COLORS
    const segments: CodeSegment[] = []
    const colorStack: Array<string | undefined> = []
    const partPattern = /<span class="([^"]+)">|<\/span>|([^<]+)/g
    let match: RegExpExecArray | null = partPattern.exec(html)

    while (match) {
      if (match[1]) {
        const tokenClass = match[1].split(/\s+/).find((className) => palette[className])
        colorStack.push(tokenClass ? palette[tokenClass] : colorStack[colorStack.length - 1])
      } else if (match[0] === "</span>") {
        colorStack.pop()
      } else if (match[2]) {
        segments.push({ text: decodeHtml(match[2]), color: colorStack[colorStack.length - 1] })
      }
      match = partPattern.exec(html)
    }

    const lines: CodeSegment[][] = [[]]
    for (const segment of segments) {
      const pieces = segment.text.split("\n")
      pieces.forEach((piece, index) => {
        if (index > 0) lines.push([])
        if (piece) lines[lines.length - 1].push({ text: piece, color: segment.color })
      })
    }
    return lines
  } catch {
    return code.split("\n").map((line) => [{ text: pdfSafeText(line) }])
  }
}

function renderInlineTokens(tokens: Token[], context: RenderContext, keyPrefix: string): React.ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`

    switch (token.type) {
      case "strong":
        return (
          <Text key={key} style={{ fontWeight: 700 }}>
            {renderInlineTokens((token as Tokens.Strong).tokens, context, `${key}-strong`)}
          </Text>
        )
      case "em":
        return (
          <Text key={key} style={{ fontStyle: "italic" }}>
            {renderInlineTokens((token as Tokens.Em).tokens, context, `${key}-em`)}
          </Text>
        )
      case "del":
        return (
          <Text key={key} style={markdownStyles.strikethrough}>
            {renderInlineTokens((token as Tokens.Del).tokens, context, `${key}-del`)}
          </Text>
        )
      case "codespan":
        return (
          <Text
            key={key}
            style={[markdownStyles.inlineCode, { fontFamily: context.codeFont }]}
            hyphenationCallback={disableHyphenation}
          >
            {pdfSafeText((token as Tokens.Codespan).text)}
          </Text>
        )
      case "link": {
        const link = token as Tokens.Link
        return (
          <Link key={key} src={link.href} style={markdownStyles.link}>
            {renderInlineTokens(link.tokens, context, `${key}-link`)}
          </Link>
        )
      }
      case "image": {
        const image = token as Tokens.Image
        return (
          <Link key={key} src={image.href} style={markdownStyles.link}>
            {pdfSafeText(image.text || image.href)}
          </Link>
        )
      }
      case "br":
        return <Text key={key}>{"\n"}</Text>
      case "html": {
        const html = token as Tokens.HTML
        if (/^<br\s*\/?\s*>$/i.test(html.raw.trim())) return <Text key={key}>{"\n"}</Text>
        const plainText = pdfSafeText(html.text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "))
        return plainText ? <Text key={key}>{plainText}</Text> : null
      }
      case "escape":
        return <Text key={key}>{pdfSafeInlineText((token as Tokens.Escape).text)}</Text>
      case "text": {
        const text = token as Tokens.Text
        return text.tokens?.length ? (
          <Text key={key}>{renderInlineTokens(text.tokens, context, `${key}-text`)}</Text>
        ) : (
          <Text key={key}>{pdfSafeInlineText(text.text)}</Text>
        )
      }
      default:
        return "text" in token && typeof token.text === "string" ? (
          <Text key={key}>{pdfSafeInlineText(token.text)}</Text>
        ) : null
    }
  })
}

function renderList(list: Tokens.List, context: RenderContext, keyPrefix: string, depth = 0) {
  const start = typeof list.start === "number" ? list.start : 1

  return (
    <View key={keyPrefix} style={[markdownStyles.list, { paddingLeft: depth ? 12 : 0 }]}>
      {list.items.map((item, index) => {
        const marker = item.task ? (item.checked ? "[x]" : "[ ]") : list.ordered ? `${start + index}.` : "•"
        const keepTogether = isShortListItem(item)
        return (
          <View
            key={`${keyPrefix}-${index}`}
            style={markdownStyles.listItem}
            minPresenceAhead={keepTogether ? 24 : 12}
            wrap={!keepTogether}
          >
            <Text style={[markdownStyles.listBullet, markdownBodyTextStyle(context)]}>{marker}</Text>
            <View style={markdownStyles.listContent}>
              {item.tokens.map((child, childIndex) => {
                const childKey = `${keyPrefix}-${index}-${childIndex}`
                if (child.type === "list") {
                  return renderList(child as Tokens.List, context, childKey, depth + 1)
                }
                if (child.type === "text" || child.type === "paragraph") {
                  const inline = (child as Tokens.Text | Tokens.Paragraph).tokens ?? []
                  return (
                    <Text
                      key={childKey}
                      style={[markdownStyles.listText, markdownBodyTextStyle(context)]}
                      orphans={2}
                      widows={2}
                      hyphenationCallback={disableHyphenation}
                    >
                      {inline.length
                        ? renderInlineTokens(inline, context, childKey)
                        : pdfSafeInlineText((child as Tokens.Text | Tokens.Paragraph).text)}
                    </Text>
                  )
                }
                return renderBlockToken(child, context, childKey)
              })}
            </View>
          </View>
        )
      })}
    </View>
  )
}

function renderTable(table: Tokens.Table, context: RenderContext, keyPrefix: string, repeatHeader = false) {
  const columnCount = Math.max(1, table.header.length)
  const cellWidth = `${100 / columnCount}%`
  const renderCell = (cell: Tokens.TableCell, index: number, header: boolean, rowKey: string) => (
    <View
      key={`${rowKey}-${index}`}
      style={[
        markdownStyles.tableCell,
        { width: cellWidth, textAlign: cell.align ?? "left" },
        header ? markdownStyles.tableHeaderCell : {},
      ]}
    >
      <Text style={header ? { fontWeight: 700 } : {}} hyphenationCallback={disableHyphenation}>
        {renderInlineTokens(cell.tokens, context, `${rowKey}-${index}`)}
      </Text>
    </View>
  )

  return (
    <View key={keyPrefix} style={markdownStyles.table} wrap={repeatHeader}>
      <View
        style={[markdownStyles.tableRow, markdownStyles.tableHeaderRow]}
        fixed={repeatHeader}
        wrap={false}
        minPresenceAhead={24}
      >
        {table.header.map((cell, index) => renderCell(cell, index, true, `${keyPrefix}-header`))}
      </View>
      {table.rows.map((row, rowIndex) => (
        <View
          key={`${keyPrefix}-row-${rowIndex}`}
          style={[markdownStyles.tableRow, rowIndex % 2 === 1 ? markdownStyles.tableAlternateRow : {}]}
          wrap={false}
        >
          {row.map((cell, index) => renderCell(cell, index, false, `${keyPrefix}-row-${rowIndex}`))}
        </View>
      ))}
    </View>
  )
}

function renderSourceCodeBlock(code: Tokens.Code, context: RenderContext, key: string) {
  const dark = context.settings.codeBlockTheme === "dark"
  const maximumCharacters = markdownCodeCharactersPerLine(context)
  const lines = parseHighlightedCode(code.text, code.lang ?? "", dark).flatMap((line) =>
    splitCodeSegments(line, maximumCharacters),
  )
  const languageLabel = (code.lang ?? "").trim().split(/\s+/, 1)[0]

  return (
    <View
      key={key}
      style={[
        markdownStyles.codeBlock,
        { backgroundColor: dark ? "#0d1117" : "#f6f8fa", borderColor: dark ? "#30363d" : "#dfe2e5" },
      ]}
    >
      {languageLabel && (
        <Text
          style={[markdownStyles.codeLanguage, { color: dark ? "#8b949e" : "#6a737d", fontFamily: context.bodyFont }]}
        >
          {languageLabel}
        </Text>
      )}
      {lines.map((line, lineIndex) => (
        <Text
          key={`${key}-line-${lineIndex}`}
          hyphenationCallback={disableHyphenation}
          style={{
            color: dark ? "#c9d1d9" : "#24292e",
            fontFamily: context.codeFont,
            fontSize: Math.max(7, context.settings.fontSize * 0.68),
            lineHeight: MARKDOWN_LEADING.code,
          }}
        >
          {line.length
            ? line.map((segment, index) => (
                <Text
                  key={`${key}-${lineIndex}-${index}`}
                  style={segment.color ? { color: segment.color } : {}}
                  hyphenationCallback={disableHyphenation}
                >
                  {segment.text}
                </Text>
              ))
            : " "}
        </Text>
      ))}
    </View>
  )
}

function renderMermaidBlock(code: Tokens.Code, context: RenderContext, key: string) {
  const fence = markdownMermaidFenceFromToken(code)
  const prepared = findPreparedMarkdownDiagram(context.preparedDiagrams, code.text, fence)
  if (prepared?.kind === "image") {
    const size = markdownDiagramSize(prepared, context)
    return (
      <View key={key} style={markdownStyles.diagramFigure} wrap={false}>
        {prepared.title && (
          <Text style={[markdownStyles.diagramTitle, { fontFamily: context.headingFont }]}>
            {pdfSafeText(prepared.title)}
          </Text>
        )}
        <Image
          src={prepared.pngDataUri}
          style={[markdownStyles.diagramImage, { width: size.width, height: size.height }]}
        />
        {prepared.caption && (
          <Text style={[markdownStyles.diagramCaption, { fontFamily: context.bodyFont }]}>
            {pdfSafeText(prepared.caption)}
          </Text>
        )}
      </View>
    )
  }

  const warning = prepared?.warning ?? "Diagram not rendered: Mermaid preparation was unavailable."
  return (
    <View key={key} style={markdownStyles.diagramFallback} minPresenceAhead={48}>
      <Text style={[markdownStyles.diagramWarning, { fontFamily: context.bodyFont }]}>{pdfSafeText(warning)}</Text>
      {renderSourceCodeBlock(code, context, `${key}-source`)}
    </View>
  )
}

function renderCodeBlock(code: Tokens.Code, context: RenderContext, key: string) {
  return isMarkdownMermaidFence(code)
    ? renderMermaidBlock(code, context, key)
    : renderSourceCodeBlock(code, context, key)
}

function renderBlockToken(token: Token, context: RenderContext, key: string): React.ReactNode {
  switch (token.type) {
    case "heading": {
      const heading = token as Tokens.Heading
      const styles = [
        markdownStyles.h1,
        markdownStyles.h2,
        markdownStyles.h3,
        markdownStyles.h4,
        markdownStyles.h5,
        markdownStyles.h6,
      ]
      return (
        <Text
          key={key}
          id={context.headingIds.get(token)}
          style={[styles[heading.depth - 1] ?? markdownStyles.h6, { fontFamily: context.headingFont }]}
          minPresenceAhead={56}
        >
          {renderInlineTokens(heading.tokens, context, `${key}-heading`)}
        </Text>
      )
    }
    case "paragraph": {
      const paragraph = token as Tokens.Paragraph
      const singleImage =
        paragraph.tokens.length === 1 && paragraph.tokens[0].type === "image"
          ? (paragraph.tokens[0] as Tokens.Image)
          : null
      if (singleImage && /^data:image\/(?:png|jpe?g);base64,/i.test(singleImage.href)) {
        return (
          <View key={key} style={markdownStyles.imageContainer} wrap={false}>
            <Image src={singleImage.href} style={markdownStyles.image} />
            {singleImage.text && <Text style={markdownStyles.imageCaption}>{pdfSafeText(singleImage.text)}</Text>}
          </View>
        )
      }
      return (
        <Text key={key} style={[markdownStyles.paragraph, markdownBodyTextStyle(context)]} orphans={2} widows={2}>
          {renderInlineTokens(paragraph.tokens, context, `${key}-paragraph`)}
        </Text>
      )
    }
    case "text": {
      const text = token as Tokens.Text
      return (
        <Text key={key} style={[markdownStyles.paragraph, markdownBodyTextStyle(context)]}>
          {text.tokens?.length ? renderInlineTokens(text.tokens, context, `${key}-text`) : pdfSafeInlineText(text.text)}
        </Text>
      )
    }
    case "code":
      return renderCodeBlock(token as Tokens.Code, context, key)
    case "list":
      return renderList(token as Tokens.List, context, key)
    case "table":
      return renderTable(token as Tokens.Table, context, key)
    case "blockquote": {
      const blockquote = token as Tokens.Blockquote
      return (
        <View key={key} style={markdownStyles.blockquote}>
          {renderBlockTokens(blockquote.tokens, context, `${key}-quote`)}
        </View>
      )
    }
    case "hr":
      return <View key={key} style={markdownStyles.hr} />
    case "html": {
      const html = token as Tokens.HTML
      const plainText = pdfSafeText(html.text.replace(/<[^>]+>/g, "").trim())
      return plainText ? (
        <Text key={key} style={[markdownStyles.paragraph, markdownBodyTextStyle(context)]}>
          {plainText}
        </Text>
      ) : null
    }
    case "space":
      return null
    default:
      return "text" in token && typeof token.text === "string" ? (
        <Text key={key} style={[markdownStyles.paragraph, markdownBodyTextStyle(context)]}>
          {pdfSafeInlineText(token.text)}
        </Text>
      ) : null
  }
}

function renderBlockTokens(tokens: Token[], context: RenderContext, keyPrefix: string) {
  return tokens.map((token, index) => renderBlockToken(token, context, `${keyPrefix}-${index}`))
}

function TableOfContents({ tokens, context }: { tokens: Token[]; context: RenderContext }) {
  const headings = tokens.filter((token): token is Tokens.Heading => token.type === "heading")
  if (!headings.length) return null

  return (
    <View style={markdownStyles.toc}>
      <Text style={[markdownStyles.tocTitle, { fontFamily: context.headingFont }]}>Table of contents</Text>
      {headings.map((heading, index) => (
        <Link
          key={`toc-${index}`}
          src={`#${context.headingIds.get(heading)}`}
          style={[
            markdownStyles.tocItem,
            { fontFamily: context.bodyFont, paddingLeft: Math.max(0, heading.depth - 1) * 10 },
          ]}
        >
          {inlinePlainText(heading.tokens)}
        </Link>
      ))}
    </View>
  )
}

function MarkdownPageChrome({ filename, context }: { filename: string; context: RenderContext }) {
  const { settings } = context
  const margin = MARGIN_POINTS[settings.margins]
  const paperLabel = `${settings.pageSize.toUpperCase()} / ${settings.orientation}`

  return (
    <>
      {settings.showHeader && (
        <View fixed style={markdownStyles.header}>
          <Text style={[markdownStyles.headerFilename, { maxWidth: "75%" }]} hyphenationCallback={disableHyphenation}>
            {pdfSafeText(filename)}
          </Text>
          <Text>{paperLabel}</Text>
        </View>
      )}
      <Text
        fixed
        style={{
          position: "absolute",
          right: margin,
          bottom: Math.max(12, margin - 8),
          fontSize: 7.5,
          color: "#667085",
        }}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </>
  )
}

function MarkdownPage({
  children,
  filename,
  context,
}: {
  children: React.ReactNode
  filename: string
  context: RenderContext
}) {
  const { settings } = context
  const margin = MARGIN_POINTS[settings.margins]

  return (
    <Page
      size={PAGE_SIZE_MAP[settings.pageSize]}
      orientation={settings.orientation}
      style={[
        markdownStyles.page,
        {
          paddingTop: margin,
          paddingRight: margin,
          paddingBottom: margin + 18,
          paddingLeft: margin,
          fontFamily: context.bodyFont,
          fontSize: settings.fontSize * 0.75,
        },
      ]}
    >
      <MarkdownPageChrome filename={filename} context={context} />
      {children}
    </Page>
  )
}

export default function PdfMarkdownDocument({
  content,
  filename,
  settings,
  preparedDiagrams,
}: PdfMarkdownDocumentProps) {
  const tokens = marked.lexer(content, { gfm: true })
  const glyphText = `${filename}\n${content}\nA4 LETTER LEGAL portrait landscape\nPage of 0123456789\nTable of contents`
  const context: RenderContext = {
    settings,
    bodyFont: fontFamily(settings.fontFamily, MULISH_LOCAL_FONT, glyphText),
    headingFont: fontFamily(settings.headingFont, MERRIWEATHER_LOCAL_FONT, glyphText),
    codeFont: fontFamily(settings.codeFont, SOURCE_CODE_PRO_LOCAL_FONT, glyphText),
    headingIds: createHeadingIds(tokens),
    preparedDiagrams,
  }
  const sections = createPageSections(tokens, settings.showToc)

  return (
    <Document title={filename} author="Codeprint" subject="Print-ready Markdown document">
      {sections.map((section) => (
        <MarkdownPage key={section.key} filename={filename} context={context}>
          {section.showToc && <TableOfContents tokens={tokens} context={context} />}
          {section.longTable
            ? renderTable(section.longTable, context, `${section.key}-long-table`, true)
            : renderBlockTokens(section.tokens, context, section.key)}
        </MarkdownPage>
      ))}
    </Document>
  )
}

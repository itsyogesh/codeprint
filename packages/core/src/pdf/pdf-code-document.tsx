"use client"

import { Document, Page, Text, View } from "@react-pdf/renderer"
import { registerLocalFontFamilyForText } from "../fonts/registry"
import { SOURCE_CODE_PRO_LOCAL_FONT } from "../fonts/source-code-pro"
import type { CodeSettings } from "../types"
import { codeLineIndent } from "./code-indent"
import { codeStyles, HLJS_COLORS, PAGE_POINT_SIZES } from "./pdf-styles"

export interface PdfCodeDocumentProps {
  code: string
  language: string
  filename: string
  settings: CodeSettings
  highlightedCode?: string
}

function decodeHighlightedText(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:0*39|x0*27);/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, value: string) => String.fromCodePoint(Number.parseInt(value, 16)))
    .replace(/&#(\d+);/g, (_, value: string) => String.fromCodePoint(Number.parseInt(value, 10)))
}

// Highlight.js can nest spans. Track the active color so markup never leaks
// into the PDF when tokens such as template substitutions are nested.
function parseHljsLine(html: string): Array<{ text: string; color?: string }> {
  const segments: Array<{ text: string; color?: string }> = []
  const colorStack: Array<string | undefined> = []
  const partPattern = /<span class="([^"]+)">|<\/span>|([^<]+)/g
  let match: RegExpExecArray | null = partPattern.exec(html)

  while (match) {
    if (match[1]) {
      const tokenClass = match[1].split(/\s+/).find((className) => HLJS_COLORS[className])
      colorStack.push(tokenClass ? HLJS_COLORS[tokenClass] : colorStack[colorStack.length - 1])
    } else if (match[0] === "</span>") {
      colorStack.pop()
    } else if (match[2]) {
      segments.push({
        text: decodeHighlightedText(match[2]),
        color: colorStack[colorStack.length - 1],
      })
    }
    match = partPattern.exec(html)
  }

  return segments
}

const disableHyphenation = (word: string) => [word]

interface CodeLineEntry {
  lineNumber: number
  text: string
  highlighted?: string
}

function physicalPageSize(settings: CodeSettings) {
  const rawPageSize = PAGE_POINT_SIZES[settings.pageSize]
  return settings.orientation === "portrait" ? rawPageSize : { width: rawPageSize.height, height: rawPageSize.width }
}

function codeColumnMetrics(settings: CodeSettings, fontSize: number) {
  const pageSize = physicalPageSize(settings)
  const columnGap = 12
  const contentWidth = pageSize.width - 60 - columnGap * (settings.columns - 1)
  const columnWidth = contentWidth / settings.columns
  const textWidth = columnWidth - (settings.lineNumbers ? 38 : 8)
  const approximateCharacterWidth = fontSize * 0.65
  const charactersPerLine = Math.max(12, Math.floor(textWidth / approximateCharacterWidth))
  const contentHeight = pageSize.height - 60 - (settings.showHeader ? 24 : 0) - 14
  const visualLinesPerColumn = Math.max(1, Math.floor(contentHeight / (fontSize * 1.5)))
  return { charactersPerLine, visualLinesPerColumn }
}

function codeChunks(text: string, charactersPerLine: number) {
  if (!text) return [""]
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(text.length, start + charactersPerLine)
    if (end < text.length && /[\p{L}\p{N}_$]/u.test(text[end - 1]) && /[()[\]{},.;:]/.test(text[end])) {
      end = Math.max(start + 1, end - 1)
    }
    chunks.push(text.slice(start, end))
    start = end
  }

  return chunks
}

function wrapHighlightedLines(segments: Array<{ text: string; color?: string }>, charactersPerLine: number) {
  const chunkLengths = codeChunks(segments.map((segment) => segment.text).join(""), charactersPerLine).map(
    (chunk) => chunk.length,
  )
  const lines: Array<Array<{ text: string; color?: string }>> = [[]]
  let chunkIndex = 0
  let remaining = chunkLengths[chunkIndex] ?? charactersPerLine

  for (const segment of segments) {
    let offset = 0
    while (offset < segment.text.length) {
      if (remaining === 0) {
        chunkIndex += 1
        lines.push([])
        remaining = chunkLengths[chunkIndex] ?? charactersPerLine
      }
      const length = Math.min(remaining, segment.text.length - offset)
      lines[lines.length - 1].push({
        text: segment.text.slice(offset, offset + length),
        color: segment.color,
      })
      offset += length
      remaining -= length
    }
  }

  return lines
}

function codeLines(code: string, highlightedCode?: string): CodeLineEntry[] {
  const highlightedLines = highlightedCode?.split("\n") ?? []
  return code.split("\n").map((text, index) => ({
    lineNumber: index + 1,
    text,
    highlighted: highlightedLines[index],
  }))
}

function paginateColumns(lines: CodeLineEntry[], settings: CodeSettings, fontSize: number) {
  const { charactersPerLine, visualLinesPerColumn } = codeColumnMetrics(settings, fontSize)
  const pages: CodeLineEntry[][][] = []
  let page: CodeLineEntry[][] = [[]]
  let columnIndex = 0
  let usedVisualLines = 0

  const startNextColumn = () => {
    columnIndex += 1
    usedVisualLines = 0
    if (columnIndex >= settings.columns) {
      pages.push(page)
      page = [[]]
      columnIndex = 0
    } else {
      page.push([])
    }
  }

  for (const line of lines) {
    const expandedText = line.text.replace(/\t/g, "    ")
    const visualLines = Math.min(visualLinesPerColumn, codeChunks(expandedText, charactersPerLine).length)
    if (page[columnIndex].length > 0 && usedVisualLines + visualLines > visualLinesPerColumn) {
      startNextColumn()
    }
    page[columnIndex].push(line)
    usedVisualLines += visualLines
  }

  if (page.some((column) => column.length > 0)) pages.push(page)
  return pages
}

function CodeLine({
  entry,
  settings,
  fontSize,
  lineHeightPoints,
  charactersPerLine,
}: {
  entry: CodeLineEntry
  settings: CodeSettings
  fontSize: number
  lineHeightPoints: number
  charactersPerLine: number
}) {
  return (
    <View style={[codeStyles.codeLine, { minHeight: lineHeightPoints }]} wrap={false}>
      {settings.lineNumbers && (
        <Text style={[codeStyles.lineNumber, { fontSize: fontSize * 0.9, lineHeight: 1.5 }]}>{entry.lineNumber}</Text>
      )}
      <View style={[codeStyles.lineCode, { fontSize, lineHeight: 1.5 }]}>
        {(settings.colorized && entry.highlighted
          ? wrapHighlightedLines(parseHljsLine(entry.highlighted), charactersPerLine)
          : codeChunks(entry.text, charactersPerLine).map((text): Array<{ text: string; color?: string }> => [{ text }])
        ).map((line, lineIndex) => {
          const textIndent = codeLineIndent(line, fontSize)
          return (
            <Text key={lineIndex} hyphenationCallback={disableHyphenation} style={{ textIndent }}>
              {line.map((segment, segmentIndex) => (
                <Text
                  key={segmentIndex}
                  style={{ textIndent, ...(segment.color ? { color: segment.color } : {}) }}
                  hyphenationCallback={disableHyphenation}
                >
                  {segment.text || " "}
                </Text>
              ))}
            </Text>
          )
        })}
      </View>
    </View>
  )
}

function PageChrome({
  filename,
  lineCount,
  settings,
}: {
  filename: string
  lineCount: number
  settings: CodeSettings
}) {
  return (
    <>
      {settings.showHeader && (
        <View style={codeStyles.header} fixed>
          <Text style={codeStyles.headerFilename}>{filename}</Text>
          <Text style={codeStyles.headerMeta}>{lineCount} lines</Text>
        </View>
      )}
      <Text
        style={codeStyles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </>
  )
}

export default function PdfCodeDocument({ code, language, filename, settings, highlightedCode }: PdfCodeDocumentProps) {
  const lines = codeLines(code, highlightedCode)
  const fontFamily = registerLocalFontFamilyForText(
    SOURCE_CODE_PRO_LOCAL_FONT,
    `${filename}\n${language}\n${code}\nlines\nPage of 0123456789`,
  )
  const fontSize = settings.fontSize * 0.75 // Scale for PDF
  const lineHeightPoints = fontSize * 1.5
  const { charactersPerLine } = codeColumnMetrics(settings, fontSize)
  const pageSize = physicalPageSize(settings)

  if (settings.columns > 1) {
    const pages = paginateColumns(lines, settings, fontSize)
    return (
      <Document title={filename} author="Codeprint">
        {pages.map((columns, pageIndex) => (
          <Page
            key={pageIndex}
            size={pageSize}
            style={[codeStyles.page, { fontFamily, fontSize, minHeight: pageSize.height }]}
            wrap={false}
          >
            <PageChrome filename={filename} lineCount={lines.length} settings={settings} />
            <View style={codeStyles.columns}>
              {columns.map((column, columnIndex) => (
                <View key={columnIndex} style={[codeStyles.column, columnIndex > 0 ? codeStyles.columnDivider : {}]}>
                  {column.map((entry) => (
                    <CodeLine
                      key={entry.lineNumber}
                      entry={entry}
                      settings={settings}
                      fontSize={fontSize}
                      lineHeightPoints={lineHeightPoints}
                      charactersPerLine={charactersPerLine}
                    />
                  ))}
                </View>
              ))}
            </View>
          </Page>
        ))}
      </Document>
    )
  }

  return (
    <Document title={filename} author="Codeprint">
      <Page size={pageSize} style={[codeStyles.page, { fontFamily, fontSize }]}>
        <PageChrome filename={filename} lineCount={lines.length} settings={settings} />

        <View style={codeStyles.codeContainer}>
          {lines.map((entry) => (
            <CodeLine
              key={entry.lineNumber}
              entry={entry}
              settings={settings}
              fontSize={fontSize}
              lineHeightPoints={lineHeightPoints}
              charactersPerLine={charactersPerLine}
            />
          ))}
        </View>
      </Page>
    </Document>
  )
}

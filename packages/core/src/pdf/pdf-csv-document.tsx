"use client"

import { Document, Page, Text, View } from "@react-pdf/renderer"
import { MULISH_LOCAL_FONT } from "../fonts/mulish"
import { registerLocalFontFamilyForText } from "../fonts/registry"
import type { CSVSettings } from "../types"
import { csvStyles, PAGE_POINT_SIZES, PAGE_SIZE_MAP } from "./pdf-styles"

const disableHyphenation = (word: string) => [word]

function wrapLongWords(text: string, charactersPerLine: number) {
  return text
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part) || part.length <= charactersPerLine) return part
      const chunks: string[] = []
      for (let index = 0; index < part.length; index += charactersPerLine) {
        chunks.push(part.slice(index, index + charactersPerLine))
      }
      return chunks.join("\n")
    })
    .join("")
}

export interface PdfCsvDocumentProps {
  code: string
  filename: string
  settings: CSVSettings
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentCell += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ",") {
        currentRow.push(currentCell.trim())
        currentCell = ""
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        currentRow.push(currentCell.trim())
        rows.push(currentRow)
        currentRow = []
        currentCell = ""
        if (char === "\r") i++
      } else {
        currentCell += char
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    rows.push(currentRow)
  }

  return rows
}

export default function PdfCsvDocument({ code, filename, settings }: PdfCsvDocumentProps) {
  const rows = parseCSV(code)
  if (rows.length === 0) return null

  const fontFamily = registerLocalFontFamilyForText(MULISH_LOCAL_FONT, `${filename}\n${code}\nPage of 0123456789`)

  const headerRow = settings.hasHeaderRow ? rows[0] : null
  const dataRows = settings.hasHeaderRow ? rows.slice(1) : rows
  const fontSize = settings.fontSize * 0.75
  const columnCount = Math.max(1, ...rows.map((row) => row.length))
  const pageSize = PAGE_POINT_SIZES[settings.pageSize]
  const physicalWidth = settings.orientation === "portrait" ? pageSize.width : pageSize.height
  const cellWidth = (physicalWidth - 60) / columnCount - 16
  const charactersPerLine = Math.max(4, Math.floor(cellWidth / (fontSize * 0.52)))

  return (
    <Document title={filename} author="Codeprint">
      <Page
        size={PAGE_SIZE_MAP[settings.pageSize]}
        orientation={settings.orientation}
        style={[csvStyles.page, { fontFamily, fontSize }]}
      >
        {settings.showHeader && (
          <View style={csvStyles.header} fixed>
            <Text>{filename}</Text>
          </View>
        )}

        <View style={csvStyles.table}>
          {headerRow && (
            <View style={csvStyles.tableHeaderRow} fixed>
              {headerRow.map((cell, i) => (
                <Text
                  key={i}
                  style={[csvStyles.tableHeaderCell, { fontSize }]}
                  hyphenationCallback={disableHyphenation}
                >
                  {wrapLongWords(cell, charactersPerLine)}
                </Text>
              ))}
            </View>
          )}

          {dataRows.map((row, rowIdx) => (
            <View
              key={rowIdx}
              style={[csvStyles.tableRow, settings.alternatingColors && rowIdx % 2 === 1 ? csvStyles.alternateRow : {}]}
              wrap={false}
            >
              {row.map((cell, cellIdx) => (
                <Text
                  key={cellIdx}
                  style={[csvStyles.tableCell, { fontSize }]}
                  hyphenationCallback={disableHyphenation}
                >
                  {wrapLongWords(cell, charactersPerLine)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text
          style={csvStyles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

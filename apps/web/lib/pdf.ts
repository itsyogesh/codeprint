export function pdfFilename(filename: string) {
  if (filename.toLowerCase().endsWith(".pdf")) return filename

  const withoutExtension = filename.replace(/\.[^/.]+$/, "")
  return `${withoutExtension || "codeprint-document"}.pdf`
}

/**
 * Reads the page tree emitted by React PDF without pulling a second PDF
 * runtime into the web app. Page dictionaries are intentionally left
 * uncompressed by PDFKit, while document content streams may be compressed.
 */
export async function readPdfPageCount(blob: Blob): Promise<number | null> {
  const bytes = await blob.arrayBuffer()
  const source = new TextDecoder("latin1").decode(bytes)
  const pageObjects = source.match(/\/Type\s*\/Page(?!s)\b/g)

  if (pageObjects?.length) return pageObjects.length

  const pageTreeCounts = Array.from(source.matchAll(/\/Type\s*\/Pages\b[\s\S]{0,1024}?\/Count\s+(\d+)/g), (match) =>
    Number.parseInt(match[1], 10),
  ).filter(Number.isFinite)

  return pageTreeCounts.length ? Math.max(...pageTreeCounts) : null
}

export function downloadPdfUrl(url: string, filename: string) {
  const link = document.createElement("a")
  link.href = url
  link.download = pdfFilename(filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function openPdfPrintDialog(url: string) {
  const printWindow = window.open(url, "_blank")
  if (!printWindow) throw new Error("The PDF print window was blocked")

  let opened = false
  let fallbackTimer: number | undefined
  const openDialog = () => {
    if (opened || printWindow.closed) return
    opened = true
    if (fallbackTimer) window.clearTimeout(fallbackTimer)
    printWindow.focus()
    printWindow.print()
  }

  printWindow.addEventListener("load", openDialog, { once: true })
  fallbackTimer = window.setTimeout(openDialog, 750)
}

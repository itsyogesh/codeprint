import { App } from "@modelcontextprotocol/ext-apps"
import { getDocument, type PDFDocumentProxy, type RenderTask } from "pdfjs-dist/build/pdf.mjs"
import * as pdfWorker from "pdfjs-dist/build/pdf.worker.mjs"

// A bundled worker implementation keeps the viewer offline and avoids worker-src/CDN dependencies.
Object.assign(globalThis, { pdfjsWorker: pdfWorker })
const app = new App({ name: "Codeprint PDF preview", version: "0.1.0" }, {})
const canvas = document.querySelector<HTMLCanvasElement>("canvas")!
const status = document.querySelector<HTMLElement>("#status")!
const pageLabel = document.querySelector<HTMLElement>("#page-label")!
const previous = document.querySelector<HTMLButtonElement>("#previous")!
const next = document.querySelector<HTMLButtonElement>("#next")!
const download = document.querySelector<HTMLButtonElement>("#download")!
let pdf: PDFDocumentProxy | undefined
let page = 1
let revision = 0
let documentRevision = 0
let task: RenderTask | undefined
let file: { uri: string; mimeType: string; blob: string } | undefined

function showError(error: unknown) {
  status.textContent =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
          ? error.message
          : "The preview could not be opened. Use the saved PDF instead."
  status.hidden = false
}

async function renderPage() {
  if (!pdf || canvas.hidden) return
  const currentRevision = revision
  task?.cancel()
  previous.disabled = page <= 1
  next.disabled = page >= pdf.numPages
  pageLabel.textContent = `Page ${page} of ${pdf.numPages}`
  const pdfPage = await pdf.getPage(page)
  if (currentRevision !== revision) return
  const width = Math.max(1, Math.min(document.querySelector<HTMLElement>("#paper")!.clientWidth, 1100))
  const base = pdfPage.getViewport({ scale: 1 })
  const scale = width / base.width
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const viewport = pdfPage.getViewport({ scale: scale * ratio })
  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)
  canvas.style.width = `${width}px`
  canvas.style.height = `${Math.ceil(base.height * scale)}px`
  task = pdfPage.render({ canvas, viewport })
  try {
    await task.promise
  } catch (error) {
    if (!(error instanceof Error) || error.name !== "RenderingCancelledException") throw error
  }
}

app.ontoolresult = async (result) => {
  const uri = result.structuredContent?.resourceUri
  if (typeof uri !== "string" || !/^codeprint:\/\/documents\/[a-f0-9-]{36}$/.test(uri)) return
  const currentRevision = ++documentRevision
  revision += 1
  task?.cancel()
  canvas.hidden = true
  file = undefined
  download.disabled = true
  previous.disabled = true
  next.disabled = true
  status.hidden = false
  status.textContent = "Opening your saved PDF…"
  try {
    const resource = await app.readServerResource({ uri })
    const content = resource.contents.find((item) => item.mimeType === "application/pdf" && "blob" in item)
    if (!content || !("blob" in content) || typeof content.blob !== "string")
      throw new Error("The server did not return a PDF.")
    const bytes = Uint8Array.from(atob(content.blob), (character) => character.charCodeAt(0))
    // Draw embedded glyphs directly, without creating blob-backed font resources in a host sandbox.
    const opened = await getDocument({ data: bytes, isEvalSupported: false, disableFontFace: true }).promise
    if (currentRevision !== documentRevision) {
      await opened.destroy()
      return
    }
    await pdf?.destroy()
    pdf = opened
    file = { uri, mimeType: "application/pdf", blob: content.blob }
    page = 1
    status.hidden = true
    canvas.hidden = false
    download.hidden = !app.getHostCapabilities()?.downloadFile
    download.disabled = false
    await renderPage()
  } catch (error) {
    if (currentRevision === documentRevision) showError(error)
  }
}

previous.addEventListener("click", () => {
  page -= 1
  revision += 1
  void renderPage().catch(showError)
})
next.addEventListener("click", () => {
  page += 1
  revision += 1
  void renderPage().catch(showError)
})
download.addEventListener("click", async () => {
  if (!file) return
  download.disabled = true
  try {
    const result = await app.downloadFile({ contents: [{ type: "resource", resource: file }] })
    if (result.isError) showError("Download was declined. Your original PDF is still saved locally.")
  } catch (error) {
    showError(error)
  } finally {
    download.disabled = false
  }
})
let resizeTimer: ReturnType<typeof setTimeout>
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    revision += 1
    void renderPage().catch(showError)
  }, 120)
})
app.onhostcontextchanged = (context) => {
  document.documentElement.dataset.theme = context.theme ?? "light"
}
app.onteardown = async () => {
  task?.cancel()
  await pdf?.destroy()
  return {}
}
void app
  .connect()
  .then(() => {
    document.documentElement.dataset.theme = app.getHostContext()?.theme ?? "light"
  })
  .catch(showError)

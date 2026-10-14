import { randomUUID } from "node:crypto"
import type { RenderedPdf } from "@codeprint/core"

/** Only PDFs created in this server session are addressable. Never read arbitrary paths. */
export class DocumentStore {
  readonly #documents = new Map<string, { bytes: Uint8Array; filename: string; pages: number }>()
  #size = 0
  #disposed = false

  constructor(
    private readonly maxBytes = 64 * 1024 * 1024,
    private readonly maxDocuments = 20,
  ) {}

  add(document: RenderedPdf) {
    if (this.#disposed) throw new Error("The PDF preview session has been disposed.")
    if (document.bytes.byteLength > this.maxBytes) throw new Error("PDF exceeds the session preview limit.")
    while (this.#documents.size >= this.maxDocuments || this.#size + document.bytes.byteLength > this.maxBytes) {
      const oldest = this.#documents.keys().next().value
      if (!oldest) break
      const evicted = this.#documents.get(oldest)!
      this.#size -= evicted.bytes.byteLength
      evicted.bytes.fill(0)
      this.#documents.delete(oldest)
    }
    const documentId = randomUUID()
    this.#documents.set(documentId, {
      // Buffer.slice() aliases its source, unlike Uint8Array.slice(). Always copy.
      bytes: Uint8Array.from(document.bytes),
      filename: document.suggestedFilename,
      pages: document.pages,
    })
    this.#size += document.bytes.byteLength
    return { documentId, resourceUri: `codeprint://documents/${documentId}` }
  }

  get(documentId: string) {
    const document = this.#documents.get(documentId)
    if (!document)
      throw new Error(
        "PDF preview has expired or does not belong to this session. Create it again; the saved file is unchanged.",
      )
    return document
  }

  list() {
    return [...this.#documents].map(([id, document]) => ({
      uri: `codeprint://documents/${id}`,
      name: document.filename,
      mimeType: "application/pdf",
    }))
  }

  dispose(): void {
    this.#disposed = true
    for (const document of this.#documents.values()) document.bytes.fill(0)
    this.#documents.clear()
    this.#size = 0
  }
}

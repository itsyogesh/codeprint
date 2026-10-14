import { randomUUID } from "node:crypto"
import type { RenderedPdf } from "@codeprint/core"

/** Only PDFs created in this server session are addressable. Never read arbitrary paths. */
export class DocumentStore {
  private readonly documents = new Map<string, { bytes: Uint8Array; filename: string; pages: number }>()
  private size = 0

  constructor(
    private readonly maxBytes = 64 * 1024 * 1024,
    private readonly maxDocuments = 20,
  ) {}

  add(document: RenderedPdf) {
    if (document.bytes.byteLength > this.maxBytes) throw new Error("PDF exceeds the session preview limit.")
    while (this.documents.size >= this.maxDocuments || this.size + document.bytes.byteLength > this.maxBytes) {
      const oldest = this.documents.keys().next().value
      if (!oldest) break
      this.size -= this.documents.get(oldest)!.bytes.byteLength
      this.documents.delete(oldest)
    }
    const documentId = randomUUID()
    this.documents.set(documentId, {
      bytes: document.bytes.slice(),
      filename: document.suggestedFilename,
      pages: document.pages,
    })
    this.size += document.bytes.byteLength
    return { documentId, resourceUri: `codeprint://documents/${documentId}` }
  }

  get(documentId: string) {
    const document = this.documents.get(documentId)
    if (!document)
      throw new Error(
        "PDF preview has expired or does not belong to this session. Create it again; the saved file is unchanged.",
      )
    return document
  }

  list() {
    return [...this.documents].map(([id, document]) => ({
      uri: `codeprint://documents/${id}`,
      name: document.filename,
      mimeType: "application/pdf",
    }))
  }
}

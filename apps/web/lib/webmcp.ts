export interface WebMcpDocument {
  content: string
  filename: string
  language?: string
  pageSize?: "a4" | "letter" | "legal"
  orientation?: "portrait" | "landscape"
}

export interface WebMcpTool {
  name: string
  title: string
  description: string
  inputSchema: Record<string, unknown>
  annotations: { readOnlyHint: boolean; consequentialHint: boolean }
  execute: (input: Record<string, unknown>, options?: { signal?: AbortSignal }) => Promise<unknown>
}

export interface WebMcpContext {
  registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): Promise<void> | void
  unregisterTool?: (name: string) => void
}

export function getWebMcpContext(document: Document, navigator: Navigator): WebMcpContext | undefined {
  // October 2026 draft uses Document; older experimental Chromium builds used Navigator.
  return (
    (document as Document & { modelContext?: WebMcpContext }).modelContext ??
    (navigator as Navigator & { modelContext?: WebMcpContext }).modelContext
  )
}

export function parseWebMcpDocument(
  input: Record<string, unknown>,
  format: "code" | "markdown" | "csv",
): WebMcpDocument {
  if (typeof input.content !== "string" || !input.content.trim() || input.content.length > 4_000_000)
    throw new Error("Supply between 1 and 4,000,000 characters of document text.")
  if (input.filename !== undefined && (typeof input.filename !== "string" || input.filename.length > 180))
    throw new Error("Filename must be at most 180 characters.")
  if (input.language !== undefined && (typeof input.language !== "string" || input.language.length > 40))
    throw new Error("Language must be at most 40 characters.")
  if (input.pageSize !== undefined && !["a4", "letter", "legal"].includes(String(input.pageSize)))
    throw new Error("Choose a4, letter, or legal.")
  if (input.orientation !== undefined && !["portrait", "landscape"].includes(String(input.orientation)))
    throw new Error("Choose portrait or landscape.")
  return {
    content: input.content,
    filename:
      typeof input.filename === "string"
        ? input.filename.split(/[\\/]/).pop() ||
          `document.${format === "markdown" ? "md" : format === "csv" ? "csv" : "txt"}`
        : `document.${format === "markdown" ? "md" : format === "csv" ? "csv" : "txt"}`,
    language: typeof input.language === "string" ? input.language : undefined,
    pageSize: input.pageSize as WebMcpDocument["pageSize"],
    orientation: input.orientation as WebMcpDocument["orientation"],
  }
}

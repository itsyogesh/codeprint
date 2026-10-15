import ipaddr from "ipaddr.js"

export const SOURCE_MAX_BYTES = 2 * 1024 * 1024
export const SOURCE_TIMEOUT_MS = 15_000

export interface ImportedSource {
  content: string
  filename: string
  format: "code" | "markdown" | "csv"
  language: string
  sourceUrl: string
  sizeBytes: number
}

export interface SourceResponse {
  status: number
  contentType: string
  bytes: Uint8Array
}

export type SourceFetcher = (url: URL, signal: AbortSignal) => Promise<SourceResponse>

export function isPublicAddress(address: string): boolean {
  try {
    const parsed = ipaddr.process(address)
    // Only ordinary global unicast, not mapped private IPs, transition networks,
    // loopback, metadata, multicast, documentation, or other special-use ranges.
    return parsed.range() === "unicast"
  } catch {
    return false
  }
}

export function publicSourceUrl(input: string): URL {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Reject URL parser ambiguities and control characters deliberately.
  if (input.length > 4096 || /[\\\u0000-\u0020\u007f]/.test(input.trim())) {
    throw new Error("Enter a valid public HTTPS file URL without spaces or backslashes.")
  }
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    throw new Error("Enter a complete public file URL starting with https://.")
  }
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) {
    throw new Error("Use a public HTTPS URL without credentials or a custom port.")
  }
  const host = url.hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .toLowerCase()
  if (
    (ipaddr.isValid(host) && !isPublicAddress(host)) ||
    (!ipaddr.isValid(host) &&
      (!host.includes(".") || /(?:^|\.)(?:localhost|local|internal|home|lan|test|invalid|example|onion)$/.test(host)))
  ) {
    throw new Error("Only public internet file URLs are supported. Local and private-network addresses are blocked.")
  }
  url.hash = ""
  return url
}

const languages: Record<string, string> = {
  c: "c",
  h: "c",
  cc: "cpp",
  cpp: "cpp",
  hpp: "cpp",
  cs: "csharp",
  css: "css",
  dart: "dart",
  go: "go",
  html: "html",
  htm: "html",
  java: "java",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  json: "json",
  jsx: "javascript",
  kt: "kotlin",
  php: "php",
  py: "python",
  r: "r",
  rb: "ruby",
  rs: "rust",
  scala: "scala",
  sh: "shell",
  bash: "shell",
  sql: "sql",
  swift: "swift",
  ts: "typescript",
  tsx: "typescript",
  xml: "xml",
  md: "markdown",
  markdown: "markdown",
}

export function sourceFilename(url: URL): string {
  let name: string
  try {
    name = decodeURIComponent(url.pathname.split("/").pop() || "source.txt")
  } catch {
    throw new Error("The file URL contains invalid encoding.")
  }
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Filenames must not carry terminal controls or path separators.
  name = name.replace(/[\u0000-\u001f\u007f/\\:*?"<>|]/g, "_").slice(0, 180)
  return name && name !== "." && name !== ".." ? name : "source.txt"
}

export function sourceType(filename: string): Pick<ImportedSource, "format" | "language"> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  if (ext === "md" || ext === "markdown" || ext === "mdx") return { format: "markdown", language: "markdown" }
  if (ext === "csv") return { format: "csv", language: "plaintext" }
  return { format: "code", language: languages[ext] ?? "plaintext" }
}

function decodeSource(response: SourceResponse, filename: string): string {
  if (response.bytes.byteLength > SOURCE_MAX_BYTES) throw new Error("The file is too large. The import limit is 2 MiB.")
  const type = response.contentType.split(";")[0].trim().toLowerCase()
  if (
    type &&
    !type.startsWith("text/") &&
    !/^(application\/(?:json|[\w.+-]+\+json|javascript|xml|[\w.+-]+\+xml|yaml|x-yaml|toml|octet-stream|csv))$/.test(
      type,
    )
  ) {
    throw new Error("This URL does not return a text file. Import code, Markdown, JSON, CSV, or plain text.")
  }
  let content: string
  try {
    content = new TextDecoder("utf-8", { fatal: true }).decode(response.bytes)
  } catch {
    throw new Error("This file is not UTF-8 text. Download it and save it as UTF-8 before uploading.")
  }
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Reject binary controls while allowing tab, CR, and LF in source text.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(content))
    throw new Error("This looks like a binary file, not source text.")
  if (!content.trim()) throw new Error("The file is empty. Choose a file containing text.")
  if ((type === "text/html" || /^\s*(?:<!doctype\s+html|<html[\s>])/i.test(content)) && !/\.html?$/i.test(filename)) {
    throw new Error("This URL returned a web page, not the file. Use a GitHub file link or a direct raw-file URL.")
  }
  return content
}

// Transport is injected: browsers use CORS fetch; Node uses DNS-checked HTTPS.
// This module never renders, executes imported text, or contacts Codeprint.
export async function importPublicSource(
  input: string,
  fetcher: SourceFetcher,
  signal?: AbortSignal,
): Promise<ImportedSource> {
  const url = publicSourceUrl(input)
  const filename = sourceFilename(url)
  const requestSignal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(SOURCE_TIMEOUT_MS)])
    : AbortSignal.timeout(SOURCE_TIMEOUT_MS)
  let candidates = [url]
  if (url.hostname === "github.com" || url.hostname === "www.github.com") {
    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent)
    if (parts.length < 5 || parts[2] !== "blob" || !/^[\w.-]+$/.test(parts[0]) || !/^[\w.-]+$/.test(parts[1])) {
      throw new Error("Use a GitHub link to a single file, with /blob/ in its path, or its Raw URL.")
    }
    const tail = parts.slice(3)
    // Resolve slash-containing refs without assuming the first segment is the
    // entire branch name. All requests stay on GitHub's fixed contents endpoint.
    candidates = Array.from({ length: Math.min(tail.length - 1, 12) }, (_, index) => {
      const split = index + 1
      const path = tail.slice(split).map(encodeURIComponent).join("/")
      const endpoint = new URL(`https://api.github.com/repos/${parts[0]}/${parts[1]}/contents/${path}`)
      endpoint.searchParams.set("ref", tail.slice(0, split).join("/"))
      return endpoint
    })
  }
  for (const candidate of candidates) {
    requestSignal.throwIfAborted()
    const response = await fetcher(candidate, requestSignal)
    if (response.status === 404 && candidates.length > 1) continue
    if (response.status === 403 || response.status === 429) {
      throw new Error(
        "The host denied access or reached its request limit. Try the public Raw link or download and upload the file.",
      )
    }
    if (response.status >= 300 && response.status < 400) {
      throw new Error("Redirecting links are not supported. Paste the final public HTTPS raw-file URL instead.")
    }
    if (response.status === 404 || response.status === 401) {
      throw new Error("The file was not found or is private. Only publicly accessible files are supported.")
    }
    if (response.status !== 200) throw new Error(`The host could not return the file (HTTP ${response.status}).`)
    return {
      content: decodeSource(response, filename),
      filename,
      ...sourceType(filename),
      sourceUrl: url.href,
      sizeBytes: response.bytes.byteLength,
    }
  }
  throw new Error(
    "The GitHub file was not found or is private. Check the branch and file path, or use its public Raw link.",
  )
}

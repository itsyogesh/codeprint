import { importPublicSource, SOURCE_MAX_BYTES, type SourceFetcher } from "./index"

const browserFetch: SourceFetcher = async (url, signal) => {
  let response: Response
  try {
    response = await fetch(url, {
      signal,
      mode: "cors",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      headers: {
        Accept: url.hostname === "api.github.com" ? "application/vnd.github.raw+json" : "text/plain, */*;q=0.1",
      },
    })
  } catch {
    if (signal.aborted) throw new Error("Import stopped or timed out. Try again with a smaller file.")
    throw new Error(
      "The host blocked browser access, redirected, or could not be reached. Use its public Raw link, or download and upload the file.",
    )
  }
  if (Number(response.headers.get("content-length")) > SOURCE_MAX_BYTES) {
    await response.body?.cancel()
    throw new Error("The file is too large. The import limit is 2 MiB.")
  }
  const reader = response.body?.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  if (reader) {
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > SOURCE_MAX_BYTES) throw new Error("The file is too large. The import limit is 2 MiB.")
        chunks.push(value)
      }
    } finally {
      await reader.cancel().catch(() => {})
      reader.releaseLock()
    }
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return { status: response.status, contentType: response.headers.get("content-type") ?? "", bytes }
}

export function importBrowserSource(url: string, signal?: AbortSignal) {
  return importPublicSource(url, browserFetch, signal)
}

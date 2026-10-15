import { type LookupAddress, lookup } from "node:dns"
import { request } from "node:https"
import { isIP, type LookupFunction } from "node:net"
import { importPublicSource, isPublicAddress, publicSourceUrl, SOURCE_MAX_BYTES, type SourceFetcher } from "./index"

// Validate every DNS answer and pass those exact addresses to the socket. No
// separate unchecked DNS lookup, proxy environment variables, or shared sockets.
export const publicLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { all: true, verbatim: true }, (error, addresses) => {
    if (error) return callback(error, "", 4)
    if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
      return callback(new Error("The URL resolves to a blocked private or special-use network."), "", 4)
    }
    if (typeof options === "object" && options.all) {
      const allCallback = callback as unknown as (error: Error | null, results: LookupAddress[]) => void
      allCallback(null, addresses)
    } else {
      const family = typeof options === "number" ? options : options.family
      const selected = addresses.find((entry) => !family || entry.family === family)
      if (!selected) return callback(new Error("No public address is available for this host."), "", 4)
      callback(null, selected.address, selected.family)
    }
  })
}

const nodeFetch: SourceFetcher = (url, signal) =>
  new Promise((resolve, reject) => {
    publicSourceUrl(url.href)
    const host = url.hostname.replace(/^\[|\]$/g, "")
    if (isIP(host) && !isPublicAddress(host)) return reject(new Error("Private-network addresses are blocked."))
    const req = request(
      url,
      {
        method: "GET",
        signal,
        agent: false,
        lookup: publicLookup,
        headers: {
          Accept: url.hostname === "api.github.com" ? "application/vnd.github.raw+json" : "text/plain, */*;q=0.1",
          "Accept-Encoding": "identity",
          "User-Agent": "Codeprint/0.2.0 (public-file-import)",
        },
      },
      (response) => {
        const status = response.statusCode ?? 0
        if (status !== 200) {
          response.destroy()
          resolve({ status, contentType: "", bytes: new Uint8Array() })
          return
        }
        if (Number(response.headers["content-length"]) > SOURCE_MAX_BYTES) {
          response.destroy()
          reject(new Error("The file is too large. The import limit is 2 MiB."))
          return
        }
        if (response.headers["content-encoding"] && response.headers["content-encoding"] !== "identity") {
          response.destroy()
          reject(new Error("The host returned unsupported compressed content. Use its raw-file link."))
          return
        }
        const chunks: Buffer[] = []
        let size = 0
        response.on("data", (chunk: Buffer) => {
          size += chunk.length
          if (size > SOURCE_MAX_BYTES) {
            response.destroy(new Error("The file is too large. The import limit is 2 MiB."))
          } else chunks.push(chunk)
        })
        response.on("end", () =>
          resolve({
            status,
            contentType: String(response.headers["content-type"] ?? ""),
            bytes: Buffer.concat(chunks),
          }),
        )
        response.on("error", reject)
        response.on("aborted", () => reject(new Error("The host closed the file transfer before it finished.")))
      },
    )
    req.on("error", (error) =>
      reject(signal.aborted ? new Error("Import stopped or timed out. Try again with a smaller file.") : error),
    )
    req.end()
  })

export function importNodeSource(url: string, signal?: AbortSignal) {
  return importPublicSource(url, nodeFetch, signal)
}
